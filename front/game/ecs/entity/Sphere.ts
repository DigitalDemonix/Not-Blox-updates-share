import { SerializedEntityType } from '@shared/network/server/serialized'
import { Entity } from '@shared/entity/Entity'
import { MeshComponent } from '../component/MeshComponent.js'
import * as THREE from 'three'
import { Game } from '@/game/game.js'
import { EntityManager } from '@shared/system/EntityManager.js'

export class Sphere {
  entity: Entity
  constructor(entityId: number) {
    this.entity = EntityManager.createEntity(SerializedEntityType.SPHERE, entityId)
  }
}
