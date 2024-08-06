import { PositionComponent } from '../../../../../shared/component/PositionComponent.js';
import { DynamicRigidBodyComponent } from '../../component/physics/DynamicRigidBodyComponent.js';
import { KinematicRigidBodyComponent } from '../../component/physics/KinematicRigidBodyComponent.js';
export class SyncPositionSystem {
    update(entities) {
        for (const entity of entities) {
            const bodyComponent = entity.getComponent(DynamicRigidBodyComponent) ||
                entity.getComponent(KinematicRigidBodyComponent);
            const positionComponent = entity.getComponent(PositionComponent);
            if (bodyComponent && positionComponent && bodyComponent.body) {
                const position = bodyComponent.body.translation();
                positionComponent.x = position.x;
                positionComponent.y = position.y;
                positionComponent.z = position.z;
            }
        }
    }
}
//# sourceMappingURL=SyncPositionSystem.js.map