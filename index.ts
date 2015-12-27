
/// <reference path="typings/tsd.d.ts" />

var makerjs: typeof MakerJs = require('makerjs');

class SpokeWedge implements MakerJs.IModel {

    public paths: MakerJs.IPathMap = {};

    constructor(spoke: MakerJs.IModel, outerRadius: number, innerRadius: number, count: number) {

        var ring = new makerjs.models.Ring(outerRadius, innerRadius);

        //punch the spoke out from the ring
        makerjs.model.combine(ring, spoke, false, true, true, false);

        var punch1: MakerJs.IModel = {
            models: {
                ring: ring,
                spoke: spoke
            }
        };
        
        //clone the punch and rotate it for one spoke's rotation
        var origin: MakerJs.IPoint = [0, 0];
        var punch2 = makerjs.model.rotate(<MakerJs.IModel>makerjs.cloneObject(punch1), 360 / count, origin);

        //combine both punches
        makerjs.model.combine(punch1, punch2, true, false, true, false);

        //we now have a wedge separated from the ring.
        var wedgeAndRing: MakerJs.IModel = {
            models: {
                punch1: punch1,
                punch2: punch2
            }
        };
        
        //to eliminate the ring, we can "discontiguate" it by removing a shape from it, leaving dead ends.
        var corner: MakerJs.IPoint = [outerRadius, -outerRadius];
        var oneDegree = makerjs.point.rotate(corner, 1, origin);
        var knife = new makerjs.models.ConnectTheDots(true, [origin, corner, oneDegree]);

        //when combined, the dead-ended lines will be removed, leaving only the wedge.
        makerjs.model.combine(wedgeAndRing, knife, false, true, false, false);

        //the wedge is a deep tree of models with many pruned nodes, so flatten it and keep only the needed paths.
        makerjs.model.walkPaths(wedgeAndRing, (modelContext, pathId, path) => {
            var id = makerjs.model.getSimilarPathId(this, pathId);
            this.paths[id] = path;
        });

    }
}
