import { EntityManager } from '../../../../shared/system/EntityManager.js';
import { SerializedEntityType } from '../../../../shared/network/server/serialized.js';
import { TrimeshCollidersComponent } from '../component/physics/TrimeshColliderComponent.js';
import { KinematicRigidBodyComponent } from '../component/physics/KinematicRigidBodyComponent.js';
import { PositionComponent } from '../../../../shared/component/PositionComponent.js';
import { ServerMeshComponent } from '../../../../shared/component/ServerMeshComponent.js';
import { NetworkDataComponent } from '../../../../shared/network/NetworkDataComponent.js';
export class MapWorld {
    entity;
    constructor(mapUrl) {
        this.entity = EntityManager.createEntity(SerializedEntityType.WORLD);
        const serverMeshComponent = new ServerMeshComponent(this.entity.id, mapUrl);
        this.entity.addComponent(serverMeshComponent);
        this.entity.addComponent(new PositionComponent(this.entity.id, 0, 0, 0));
        this.entity.addComponent(new KinematicRigidBodyComponent(this.entity.id));
        this.entity.addComponent(new TrimeshCollidersComponent(this.entity.id, mapUrl));
        this.entity.addComponent(new NetworkDataComponent(this.entity.id, this.entity.type, [serverMeshComponent]));
    }
}
//# sourceMappingURL=MapWorld.js.map