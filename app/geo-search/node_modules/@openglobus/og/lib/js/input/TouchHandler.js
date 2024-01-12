class TouchHandler {
    constructor(htmlObject) {
        this._htmlObject = htmlObject;
    }
    setEvent(event, sender, callback) {
        switch (event) {
            case "touchcancel":
                this._htmlObject.addEventListener('touchcancel', function (event) {
                    event.preventDefault();
                    const rect = this.getBoundingClientRect();
                    const eventExt = Object.assign(event, { offsetLeft: rect.left, offsetTop: rect.top });
                    callback.call(sender, eventExt);
                });
                break;
            case "touchstart":
                this._htmlObject.addEventListener('touchstart', function (event) {
                    event.preventDefault();
                    const rect = this.getBoundingClientRect();
                    const eventExt = Object.assign(event, { offsetLeft: rect.left, offsetTop: rect.top });
                    callback.call(sender, eventExt);
                });
                break;
            case "touchend":
                this._htmlObject.addEventListener('touchend', function (event) {
                    event.preventDefault();
                    const rect = this.getBoundingClientRect();
                    const eventExt = Object.assign(event, { offsetLeft: rect.left, offsetTop: rect.top });
                    callback.call(sender, eventExt);
                });
                break;
            case "touchmove":
                this._htmlObject.addEventListener('touchmove', function (event) {
                    event.preventDefault();
                    const rect = this.getBoundingClientRect();
                    const eventExt = Object.assign(event, { offsetLeft: rect.left, offsetTop: rect.top });
                    callback.call(sender, eventExt);
                });
                break;
        }
    }
}
export { TouchHandler };
