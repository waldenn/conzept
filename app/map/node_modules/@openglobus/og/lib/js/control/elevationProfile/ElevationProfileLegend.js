import { View } from '../../ui/View';
import { distanceFormatExt } from "../../utils/shared";
const TEMPLATE = `<div class="og-elevationprofile-legend">
        <div class="og-elevationprofile-legend__row og-elevationprofile-legend__track">
          <div class="og-elevationprofile-square"></div>
          <div class="og-elevationprofile-value">0</div>
          <div class="og-elevationprofile-units">m</div>
        </div>
        <div class="og-elevationprofile-legend__row og-elevationprofile-legend__ground">
          <div class="og-elevationprofile-square"></div>
          <div class="og-elevationprofile-value">0</div>
          <div class="og-elevationprofile-units">m</div>
        </div>
        <div class="og-elevationprofile-legend__row og-elevationprofile-legend__warning">        
          <div class="og-elevationprofile-square"></div>
          <div class="og-elevationprofile-value">0</div>
          <div class="og-elevationprofile-units">m</div>
        </div>
        <div class="og-elevationprofile-legend__row og-elevationprofile-legend__collision">
          <div class="og-elevationprofile-square"></div>
          <div class="og-elevationprofile-value">0</div>
          <div class="og-elevationprofile-units">m</div>
        </div>
      </div>`;
export class ElevationProfileLegend extends View {
    constructor(params = {}) {
        super({
            ...params,
            template: TEMPLATE
        });
        this.$groundValue = null;
        this.$trackValue = null;
        this.$warningValue = null;
        this.$collisionValue = null;
        this.$trackUnits = null;
        this.$groundUnits = null;
        this.$warningUnits = null;
        this.$collisionUnits = null;
    }
    render(params) {
        super.render(params);
        this.$trackValue = this.select(".og-elevationprofile-legend__track .og-elevationprofile-value");
        this.$groundValue = this.select(".og-elevationprofile-legend__ground .og-elevationprofile-value");
        this.$warningValue = this.select(".og-elevationprofile-legend__warning .og-elevationprofile-value");
        this.$collisionValue = this.select(".og-elevationprofile-legend__collision .og-elevationprofile-value");
        this.$trackUnits = this.select(".og-elevationprofile-legend__track .og-elevationprofile-units");
        this.$groundUnits = this.select(".og-elevationprofile-legend__ground .og-elevationprofile-units");
        this.$warningUnits = this.select(".og-elevationprofile-legend__warning .og-elevationprofile-units");
        this.$collisionUnits = this.select(".og-elevationprofile-legend__collision .og-elevationprofile-units");
        return this;
    }
    clear() {
        this.$trackValue && (this.$trackValue.innerText = "0");
        this.$trackUnits && (this.$trackUnits.innerText = "m");
        this.$groundValue && (this.$groundValue.innerText = "0");
        this.$groundUnits && (this.$groundUnits.innerText = "m");
        this.$warningValue && (this.$warningValue.innerText = "0");
        this.$warningUnits && (this.$warningUnits.innerText = "m");
        this.$collisionValue && (this.$collisionValue.innerText = "0");
        this.$collisionUnits && (this.$collisionUnits.innerText = "m");
    }
    setTrackLength(trackLength) {
        let dist = distanceFormatExt(trackLength);
        this.$trackValue.innerText = dist[0];
        this.$trackUnits.innerText = dist[1];
    }
    setGroundLength(groundLength) {
        let dist = distanceFormatExt(groundLength);
        this.$groundValue.innerText = dist[0];
        this.$groundUnits.innerText = dist[1];
    }
    setWarningLength(warningLength) {
        let warningDist = distanceFormatExt(warningLength);
        this.$warningValue.innerText = warningDist[0];
        this.$warningUnits.innerText = warningDist[1];
    }
    setCollisionLength(collisionLength) {
        let collisionDist = distanceFormatExt(collisionLength);
        this.$collisionValue.innerText = collisionDist[0];
        this.$collisionUnits.innerText = collisionDist[1];
    }
}
