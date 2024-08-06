import { Game } from '@/game/game'
import { Entity } from '@shared/entity/Entity'
import { Cube } from '../entity/Cube'
import { Player } from '../entity/Player'
import { Sphere } from '../entity/Sphere'
import { Chat } from '../entity/Chat'

import {
  SerializedComponent,
  SerializedComponentType,
  SerializedEntity,
  SerializedEntityType,
  SerializedStateType,
  SnapshotMessage,
} from '@shared/network/server/serialized'

import { ChatListComponent } from '@shared/component/ChatComponent'
import { ColorComponent } from '@shared/component/ColorComponent'
import { PositionComponent } from '@shared/component/PositionComponent'
import { RotationComponent } from '@shared/component/RotationComponent'
import { SingleSizeComponent } from '@shared/component/SingleSizeComponent'
import { SizeComponent } from '@shared/component/SizeComponent'
import { StateComponent } from '@shared/component/StateComponent'
import { EntityDestroyedEvent } from '@shared/component/events/EntityDestroyedEvent'
import { ServerMeshComponent } from '@shared/component/ServerMeshComponent'

import { MeshComponent } from '../component/MeshComponent'
import { TransformControlsComponent } from '../component/TransformControlsComponent'

import { NetworkComponent } from '@shared/network/NetworkComponent'
import { EventSystem } from '@shared/system/EventSystem'
import { EventListComponent } from '@shared/component/events/EventListComponent'
import { EntityManager } from '@shared/system/EntityManager'

export class SyncComponentsSystem {
  private snapshotMessages: SnapshotMessage[] = []
  constructor(public game: Game) {}
  addSnapshotMessage(snapshotMessage: SnapshotMessage) {
    this.snapshotMessages.push(snapshotMessage)
  }
  handleEventEntity(serializedEventQueueEntity: SerializedEntity) {
    const eventEntity = EventSystem.getInstance().eventQueue.entity

    for (const serializedComponent of serializedEventQueueEntity.c) {
      const eventComponent = this.createComponent(serializedComponent, eventEntity.id)
      if (!eventComponent) {
        console.error(
          "Can't create event component, add it to createComponent",
          serializedComponent
        )
        continue
      }
      EventSystem.addEvent(eventComponent)
    }
  }
  update(entities: Entity[]) {
    for (const [index, snapshotMessage] of this.snapshotMessages.entries()) {
      const serializedEntities = snapshotMessage.e
      for (const serializedEntity of serializedEntities) {
        // The EventQueue entity already exist on the client (EventSystem instance constructor creates it), we don't need to create it
        // We need to handle the events by adding them to the EventQueue entity on the EventSystem instance
        if (serializedEntity.t === SerializedEntityType.EVENT_QUEUE) {
          this.handleEventEntity(serializedEntity)
          continue
        }

        let entity = entities.find((entity) => entity.id === serializedEntity.id)

        if (!entity) {
          entity = this.createEntity(serializedEntity)
          if (!entity) {
            console.error("Can't create entity, add it to createEntity")
            return
          }
        }

        for (const serializedComponent of serializedEntity.c) {
          this.updateOrCreateComponent(entity, serializedComponent)
        }
      }
      // Remove the processed snapshotMessage from the array
      this.snapshotMessages.splice(index, 1)
    }
  }

  updateOrCreateComponent(entity: Entity, serializedComponent: SerializedComponent) {
    // Find the replicated components
    const component = entity.getNetworkComponentBySerializedType(serializedComponent.t!)

    if (component) {
      // If the NetworkComponent exists, we update it
      const networkComponent = component as NetworkComponent
      networkComponent.deserialize(serializedComponent)
      networkComponent.updated = true
    } else {
      // If the NetworkComponent doesn't exist, create it
      const newComponent = this.createComponent(serializedComponent, entity.id)
      if (newComponent) {
        entity.addComponent(newComponent)
      } else {
        console.error(
          `Can't create received NetworkComponent of type ${serializedComponent.t}, add it to the createComponent function.`
        )
      }
    }
  }

  createEntity(serializedEntity: SerializedEntity): Entity | undefined {
    let newEntity: Entity | undefined

    switch (serializedEntity.t) {
      case SerializedEntityType.PLAYER:
        const player = new Player(serializedEntity.id)
        newEntity = player.entity
        break
      case SerializedEntityType.CUBE:
        const cube = new Cube(serializedEntity.id)
        newEntity = cube.entity
        break
      case SerializedEntityType.SPHERE:
        const sphere = new Sphere(serializedEntity.id)
        newEntity = sphere.entity
        break
      case SerializedEntityType.CHAT:
        newEntity = new Chat(serializedEntity.id).entity
        break
      case SerializedEntityType.EVENT_QUEUE:
        newEntity = EventSystem.getInstance().eventQueue.entity
        break
      default:
        newEntity = EntityManager.createEntity(serializedEntity.t, serializedEntity.id)
        console.warn("Unknown entity type, can't create entity")
        break
    }

    return newEntity
  }

  createComponent(
    serializedComponent: SerializedComponent,
    entityId: number
  ): NetworkComponent | undefined {
    let component: NetworkComponent | undefined

    switch (serializedComponent.t) {
      case SerializedComponentType.POSITION:
        component = new PositionComponent(entityId, 1, 1, 1)
        break
      case SerializedComponentType.ROTATION:
        component = new RotationComponent(entityId, 1, 1, 1, 1)
        break
      case SerializedComponentType.SIZE:
        component = new SizeComponent(entityId, 1, 1, 1)
        break
      case SerializedComponentType.DESTROYED_EVENT:
        component = new EntityDestroyedEvent(entityId)
        break
      case SerializedComponentType.COLOR:
        component = new ColorComponent(entityId, '0xffffff')
        break
      case SerializedComponentType.SINGLE_SIZE:
        component = new SingleSizeComponent(entityId, 0)
        break
      case SerializedComponentType.STATE:
        component = new StateComponent(entityId, SerializedStateType.IDLE)
        break
      case SerializedComponentType.CHAT_LIST:
        component = new ChatListComponent(entityId, [])
        break
      case SerializedComponentType.SERVER_MESH:
        component = new ServerMeshComponent(entityId, '')
        break
      case SerializedComponentType.TRANSFORM_CONTROLS:
        component = new TransformControlsComponent(entityId)
        break
      default:
        console.error("Unknown component type, can't create component")
    }
    // Default values will be overwritten by the serialized values
    component?.deserialize(serializedComponent)
    return component
  }
}