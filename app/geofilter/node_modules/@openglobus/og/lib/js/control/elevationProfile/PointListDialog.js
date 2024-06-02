import { Button } from "../../ui/Button";
import { View } from "../../ui/View";
import { Dialog } from "../../ui/Dialog";
import { LonLat } from "../../LonLat";
const LIST_TEMPLATE = `<div class="og-elevationprofile-list">
        <textarea placeholder="[[lon, lat, height], [lon, lat, height], ..., [lon, lat, height]]"></textarea>
        <div class="og-elevationprofile-list-buttons"></div>
    </div>`;
class PointListDialog extends Dialog {
    constructor(params) {
        super({
            title: "Points List",
            visible: false,
            resizable: true,
            useHide: true,
            top: 150,
            left: 200,
            width: 400,
            height: 300,
            minHeight: 100,
            minWidth: 100,
            ...params
        });
        this._onApplyClick = () => {
            try {
                this.model.clear();
                let coordsArr = JSON.parse(this.$textarea.value);
                let lonLatArr = new Array(coordsArr.length);
                for (let i = 0; i < coordsArr.length; i++) {
                    let ci = coordsArr[i];
                    lonLatArr[i] = new LonLat(ci[0], ci[1], ci[2]);
                }
                this.model.addPointLonLatArrayAsync(lonLatArr);
            }
            catch (err) {
                console.error(err);
            }
        };
        this.$textarea = null;
    }
    render(params) {
        super.render(params);
        let view = new View({
            template: LIST_TEMPLATE
        });
        view.appendTo(this.container);
        let applyBtn = new Button({
            classList: ["og-elevationprofile-list-apply"],
            icon: "Apply"
        });
        applyBtn.appendTo(view.select(".og-elevationprofile-list-buttons"));
        applyBtn.events.on("click", this._onApplyClick);
        this.$textarea = view.select("textarea");
        return this;
    }
}
export { PointListDialog };
