let weaviate = {};

(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // graphql/where.js
  var GraphQLWhere;
  var init_where = __esm({
    "graphql/where.js"() {
      GraphQLWhere = class {
        constructor(whereObj) {
          this.source = whereObj;
        }
        toString() {
          this.parse();
          this.validate();
          if (this.operands) {
            return `{operator:${this.operator},operands:[${this.operands}]}`;
          } else {
            const valueContent = this.marshalValueContent();
            return `{operator:${this.operator},${this.valueType}:${valueContent},path:${JSON.stringify(this.path)}}`;
          }
        }
        marshalValueContent() {
          if (this.valueType == "valueGeoRange") {
            return this.marshalValueGeoRange();
          }
          return JSON.stringify(this.valueContent);
        }
        marshalValueGeoRange() {
          let parts = [];
          const gc = this.valueContent.geoCoordinates;
          if (gc) {
            let gcParts = [];
            if (gc.latitude) {
              gcParts = [...gcParts, `latitude:${gc.latitude}`];
            }
            if (gc.longitude) {
              gcParts = [...gcParts, `longitude:${gc.longitude}`];
            }
            parts = [...parts, `geoCoordinates:{${gcParts.join(",")}}`];
          }
          const d = this.valueContent.distance;
          if (d) {
            let dParts = [];
            if (d.max) {
              dParts = [...dParts, `max:${d.max}`];
            }
            parts = [...parts, `distance:{${dParts.join(",")}}`];
          }
          return `{${parts.join(",")}}`;
        }
        validate() {
          if (!this.operator) {
            throw new Error("where filter: operator cannot be empty");
          }
          if (!this.operands) {
            if (!this.valueType) {
              throw new Error("where filter: value<Type> cannot be empty");
            }
            if (!this.path) {
              throw new Error("where filter: path cannot be empty");
            }
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "operator":
                this.parseOperator(this.source[key]);
                break;
              case "operands":
                this.parseOperands(this.source[key]);
                break;
              case "path":
                this.parsePath(this.source[key]);
                break;
              default:
                if (key.indexOf("value") != 0) {
                  throw new Error("where filter: unrecognized key '" + key + "'");
                }
                this.parseValue(key, this.source[key]);
            }
          }
        }
        parseOperator(op) {
          if (typeof op !== "string") {
            throw new Error("where filter: operator must be a string");
          }
          this.operator = op;
        }
        parsePath(path) {
          if (!Array.isArray(path)) {
            throw new Error("where filter: path must be an array");
          }
          this.path = path;
        }
        parseValue(key, value) {
          switch (key) {
            case "valueString":
            case "valueText":
            case "valueInt":
            case "valueNumber":
            case "valueDate":
            case "valueBoolean":
            case "valueGeoRange":
              break;
            default:
              throw new Error("where filter: unrecognized value prop '" + key + "'");
          }
          this.valueType = key;
          this.valueContent = value;
        }
        parseOperands(ops) {
          if (!Array.isArray(ops)) {
            throw new Error("where filter: operands must be an array");
          }
          this.operands = ops.map((element) => {
            return new GraphQLWhere(element).toString();
          }).join(",");
        }
      };
    }
  });

  // graphql/aggregator.js
  var Aggregator;
  var init_aggregator = __esm({
    "graphql/aggregator.js"() {
      init_where();
      Aggregator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withFields = (fields) => {
          this.fields = fields;
          return this;
        };
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withWhere = (whereObj) => {
          try {
            this.whereString = new GraphQLWhere(whereObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withLimit = (limit) => {
          this.limit = limit;
          return this;
        };
        withGroupBy = (groupBy) => {
          this.groupBy = groupBy;
          return this;
        };
        validateGroup = () => {
          if (!this.groupBy) {
            return;
          }
          if (!Array.isArray(this.groupBy)) {
            throw new Error("groupBy must be an array");
          }
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateGroup();
          this.validateIsSet(this.className, "className", ".withClassName(className)");
          this.validateIsSet(this.fields, "fields", ".withFields(fields)");
        };
        do = () => {
          let params = "";
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          if (this.whereString || this.limit || this.groupBy) {
            let args = [];
            if (this.whereString) {
              args = [...args, `where:${this.whereString}`];
            }
            if (this.groupBy) {
              args = [...args, `groupBy:${JSON.stringify(this.groupBy)}`];
            }
            if (this.limit) {
              args = [...args, `limit:${this.limit}`];
            }
            params = `(${args.join(",")})`;
          }
          return this.client.query(`{Aggregate{${this.className}${params}{${this.fields}}}}`);
        };
      };
    }
  });

  // graphql/nearText.js
  var GraphQLNearText;
  var init_nearText = __esm({
    "graphql/nearText.js"() {
      GraphQLNearText = class {
        constructor(nearTextObj) {
          this.source = nearTextObj;
        }
        toString(wrap = true) {
          this.parse();
          this.validate();
          let args = [`concepts:${JSON.stringify(this.concepts)}`];
          if (this.certainty) {
            args = [...args, `certainty:${this.certainty}`];
          }
          if (this.moveTo) {
            let moveToArgs = [`concepts:${JSON.stringify(this.moveToConcepts)}`];
            if (this.moveToForce) {
              moveToArgs = [...moveToArgs, `force:${this.moveToForce}`];
            }
            args = [...args, `moveTo:{${moveToArgs.join(",")}}`];
          }
          if (this.moveAwayFrom) {
            let moveAwayFromArgs = [
              `concepts:${JSON.stringify(this.moveAwayFromConcepts)}`
            ];
            if (this.moveAwayFromForce) {
              moveAwayFromArgs = [
                ...moveAwayFromArgs,
                `force:${this.moveAwayFromForce}`
              ];
            }
            args = [...args, `moveAwayFrom:{${moveAwayFromArgs.join(",")}}`];
          }
          if (this.autocorrect !== void 0) {
            args = [...args, `autocorrect:${this.autocorrect}`];
          }
          if (!wrap) {
            return `${args.join(",")}`;
          }
          return `{${args.join(",")}}`;
        }
        validate() {
          if (!this.concepts) {
            throw new Error("nearText filter: concepts cannot be empty");
          }
          if (this.moveTo) {
            if (!this.moveToForce || !this.moveToConcepts) {
              throw new Error("nearText filter: moveTo must have fields 'concepts' and 'force'");
            }
          }
          if (this.moveAwayFrom) {
            if (!this.moveAwayFromForce || !this.moveAwayFromConcepts) {
              throw new Error("nearText filter: moveAwayFrom must have fields 'concepts' and 'force'");
            }
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "concepts":
                this.parseConcepts(this.source[key]);
                break;
              case "certainty":
                this.parseCertainty(this.source[key]);
                break;
              case "moveTo":
                this.parseMoveTo(this.source[key]);
                break;
              case "moveAwayFrom":
                this.parseMoveAwayFrom(this.source[key]);
                break;
              case "autocorrect":
                this.parseAutocorrect(this.source[key]);
                break;
              default:
                throw new Error("nearText filter: unrecognized key '" + key + "'");
            }
          }
        }
        parseConcepts(concepts) {
          if (!Array.isArray(concepts)) {
            throw new Error("nearText filter: concepts must be an array");
          }
          this.concepts = concepts;
        }
        parseCertainty(cert) {
          if (typeof cert !== "number") {
            throw new Error("nearText filter: certainty must be a number");
          }
          this.certainty = cert;
        }
        parseMoveTo(target) {
          if (typeof target !== "object") {
            throw new Error("nearText filter: moveTo must be object");
          }
          if (!Array.isArray(target.concepts)) {
            throw new Error("nearText filter: moveTo.concepts must be an array");
          }
          if (target.force && typeof target.force != "number") {
            throw new Error("nearText filter: moveTo.force must be a number");
          }
          this.moveTo = true;
          this.moveToConcepts = target.concepts;
          this.moveToForce = target.force;
        }
        parseMoveAwayFrom(target) {
          if (typeof target !== "object") {
            throw new Error("nearText filter: moveAwayFrom must be object");
          }
          if (!Array.isArray(target.concepts)) {
            throw new Error("nearText filter: moveAwayFrom.concepts must be an array");
          }
          if (target.force && typeof target.force != "number") {
            throw new Error("nearText filter: moveAwayFrom.force must be a number");
          }
          this.moveAwayFrom = true;
          this.moveAwayFromConcepts = target.concepts;
          this.moveAwayFromForce = target.force;
        }
        parseAutocorrect(autocorrect) {
          if (typeof autocorrect !== "boolean") {
            throw new Error("nearText filter: autocorrect must be a boolean");
          }
          this.autocorrect = autocorrect;
        }
      };
    }
  });

  // graphql/nearVector.js
  var GraphQLNearVector;
  var init_nearVector = __esm({
    "graphql/nearVector.js"() {
      GraphQLNearVector = class {
        constructor(nearVectorObj) {
          this.source = nearVectorObj;
        }
        toString(wrap = true) {
          this.parse();
          this.validate();
          let args = [`vector:${JSON.stringify(this.vector)}`];
          if (this.certainty) {
            args = [...args, `certainty:${this.certainty}`];
          }
          if (!wrap) {
            return `${args.join(",")}`;
          }
          return `{${args.join(",")}}`;
        }
        validate() {
          if (!this.vector) {
            throw new Error("nearVector filter: vector cannot be empty");
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "vector":
                this.parseVector(this.source[key]);
                break;
              case "certainty":
                this.parseCertainty(this.source[key]);
                break;
              default:
                throw new Error("nearVector filter: unrecognized key '" + key + "'");
            }
          }
        }
        parseVector(vector) {
          if (!Array.isArray(vector)) {
            throw new Error("nearVector filter: vector must be an array");
          }
          vector.forEach((elem) => {
            if (typeof elem !== "number") {
              throw new Error("nearVector filter: vector elements must be a number");
            }
          });
          this.vector = vector;
        }
        parseCertainty(cert) {
          if (typeof cert !== "number") {
            throw new Error("nearVector filter: certainty must be a number");
          }
          this.certainty = cert;
        }
      };
    }
  });

  // graphql/nearObject.js
  var GraphQLNearObject;
  var init_nearObject = __esm({
    "graphql/nearObject.js"() {
      GraphQLNearObject = class {
        constructor(nearObjectObj) {
          this.source = nearObjectObj;
        }
        toString(wrap = true) {
          this.parse();
          this.validate();
          let args = [];
          if (this.id) {
            args = [...args, `id:${JSON.stringify(this.id)}`];
          }
          if (this.beacon) {
            args = [...args, `beacon:${JSON.stringify(this.beacon)}`];
          }
          if (this.certainty) {
            args = [...args, `certainty:${this.certainty}`];
          }
          if (!wrap) {
            return `${args.join(",")}`;
          }
          return `{${args.join(",")}}`;
        }
        validate() {
          if (!this.id && !this.beacon) {
            throw new Error("nearObject filter: id or beacon needs to be set");
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "id":
                this.parseID(this.source[key]);
                break;
              case "beacon":
                this.parseBeacon(this.source[key]);
                break;
              case "certainty":
                this.parseCertainty(this.source[key]);
                break;
              default:
                throw new Error("nearObject filter: unrecognized key '" + key + "'");
            }
          }
        }
        parseID(id) {
          if (typeof id !== "string") {
            throw new Error("nearObject filter: id must be a string");
          }
          this.id = id;
        }
        parseBeacon(beacon) {
          if (typeof beacon !== "string") {
            throw new Error("nearObject filter: beacon must be a string");
          }
          this.beacon = beacon;
        }
        parseCertainty(cert) {
          if (typeof cert !== "number") {
            throw new Error("nearObject filter: certainty must be a number");
          }
          this.certainty = cert;
        }
      };
    }
  });

  // graphql/nearImage.js
  var GraphQLNearImage;
  var init_nearImage = __esm({
    "graphql/nearImage.js"() {
      GraphQLNearImage = class {
        constructor(nearImageObj) {
          this.source = nearImageObj;
        }
        toString(wrap = true) {
          this.parse();
          this.validate();
          let args = [];
          if (this.image) {
            let img = this.image;
            if (img.startsWith("data:")) {
              const base64part = ";base64,";
              img = img.substring(img.indexOf(base64part) + base64part.length);
            }
            args = [...args, `image:${JSON.stringify(img)}`];
          }
          if (this.certainty) {
            args = [...args, `certainty:${this.certainty}`];
          }
          if (!wrap) {
            return `${args.join(",")}`;
          }
          return `{${args.join(",")}}`;
        }
        validate() {
          if (!this.image && !this.imageBlob) {
            throw new Error("nearImage filter: image or imageBlob must be present");
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "image":
                this.parseImage(this.source[key]);
                break;
              case "certainty":
                this.parseCertainty(this.source[key]);
                break;
              default:
                throw new Error("nearImage filter: unrecognized key '" + key + "'");
            }
          }
        }
        parseImage(image) {
          if (typeof image !== "string") {
            throw new Error("nearImage filter: image must be a string");
          }
          this.image = image;
        }
        parseCertainty(cert) {
          if (typeof cert !== "number") {
            throw new Error("nearImage filter: certainty must be a number");
          }
          this.certainty = cert;
        }
      };
    }
  });

  // graphql/ask.js
  var GraphQLAsk;
  var init_ask = __esm({
    "graphql/ask.js"() {
      GraphQLAsk = class {
        constructor(askObj) {
          this.source = askObj;
        }
        toString(wrap = true) {
          this.parse();
          this.validate();
          let args = [];
          if (this.question) {
            args = [...args, `question:${JSON.stringify(this.question)}`];
          }
          if (this.properties) {
            args = [...args, `properties:${JSON.stringify(this.properties)}`];
          }
          if (this.certainty) {
            args = [...args, `certainty:${this.certainty}`];
          }
          if (this.autocorrect !== void 0) {
            args = [...args, `autocorrect:${this.autocorrect}`];
          }
          if (!wrap) {
            return `${args.join(",")}`;
          }
          return `{${args.join(",")}}`;
        }
        validate() {
          if (!this.question) {
            throw new Error("ask filter: question needs to be set");
          }
        }
        parse() {
          for (let key in this.source) {
            switch (key) {
              case "question":
                this.parseQuestion(this.source[key]);
                break;
              case "properties":
                this.parseProperties(this.source[key]);
                break;
              case "certainty":
                this.parseCertainty(this.source[key]);
                break;
              case "autocorrect":
                this.parseAutocorrect(this.source[key]);
                break;
              default:
                throw new Error("ask filter: unrecognized key '" + key + "'");
            }
          }
        }
        parseQuestion(question) {
          if (typeof question !== "string") {
            throw new Error("ask filter: question must be a string");
          }
          this.question = question;
        }
        parseProperties(properties) {
          if (!Array.isArray(properties)) {
            throw new Error("ask filter: properties must be an array");
          }
          this.properties = properties;
        }
        parseCertainty(cert) {
          if (typeof cert !== "number") {
            throw new Error("ask filter: certainty must be a number");
          }
          this.certainty = cert;
        }
        parseAutocorrect(autocorrect) {
          if (typeof autocorrect !== "boolean") {
            throw new Error("ask filter: autocorrect must be a boolean");
          }
          this.autocorrect = autocorrect;
        }
      };
    }
  });

  // graphql/group.js
  var GraphQLGroup;
  var init_group = __esm({
    "graphql/group.js"() {
      GraphQLGroup = class {
        constructor(source) {
          this.source = source;
        }
        toString() {
          let parts = [];
          if (this.source.type) {
            parts = [...parts, `type:${this.source.type}`];
          }
          if (this.source.force) {
            parts = [...parts, `force:${this.source.force}`];
          }
          return `{${parts.join(",")}}`;
        }
      };
    }
  });

  // graphql/getter.js
  var Getter;
  var init_getter = __esm({
    "graphql/getter.js"() {
      init_where();
      init_nearText();
      init_nearVector();
      init_nearObject();
      init_nearImage();
      init_ask();
      init_group();
      Getter = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withFields = (fields) => {
          this.fields = fields;
          return this;
        };
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withGroup = (groupObj) => {
          try {
            this.groupString = new GraphQLGroup(groupObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withWhere = (whereObj) => {
          try {
            this.whereString = new GraphQLWhere(whereObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearText = (nearTextObj) => {
          try {
            this.nearTextString = new GraphQLNearText(nearTextObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearObject = (nearObjectObj) => {
          try {
            this.nearObjectString = new GraphQLNearObject(nearObjectObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withAsk = (askObj) => {
          try {
            this.askString = new GraphQLAsk(askObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearImage = (nearImageObj) => {
          try {
            this.nearImageString = new GraphQLNearImage(nearImageObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearVector = (nearVectorObj) => {
          try {
            this.nearVectorString = new GraphQLNearVector(nearVectorObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withLimit = (limit) => {
          this.limit = limit;
          return this;
        };
        withOffset = (offset) => {
          this.offset = offset;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.className, "className", ".withClassName(className)");
          this.validateIsSet(this.fields, "fields", ".withFields(fields)");
        };
        do = () => {
          let params = "";
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          if (this.whereString || this.nearTextString || this.nearObjectString || this.nearVectorString || this.askString || this.nearImageString || this.limit || this.offset || this.groupString) {
            let args = [];
            if (this.whereString) {
              args = [...args, `where:${this.whereString}`];
            }
            if (this.nearTextString) {
              args = [...args, `nearText:${this.nearTextString}`];
            }
            if (this.nearObjectString) {
              args = [...args, `nearObject:${this.nearObjectString}`];
            }
            if (this.askString) {
              args = [...args, `ask:${this.askString}`];
            }
            if (this.nearImageString) {
              args = [...args, `nearImage:${this.nearImageString}`];
            }
            if (this.nearVectorString) {
              args = [...args, `nearVector:${this.nearVectorString}`];
            }
            if (this.groupString) {
              args = [...args, `group:${this.groupString}`];
            }
            if (this.limit) {
              args = [...args, `limit:${this.limit}`];
            }
            if (this.offset) {
              args = [...args, `offset:${this.offset}`];
            }
            params = `(${args.join(",")})`;
          }
          return this.client.query(`{Get{${this.className}${params}{${this.fields}}}}`);
        };
      };
    }
  });

  // kinds.js
  var validateKind, KIND_THINGS, KIND_ACTIONS;
  var init_kinds = __esm({
    "kinds.js"() {
      validateKind = (kind) => {
        if (kind != KIND_THINGS && kind != KIND_ACTIONS) {
          throw new Error("invalid kind: " + kind);
        }
      };
      KIND_THINGS = "things";
      KIND_ACTIONS = "actions";
    }
  });

  // graphql/explorer.js
  var Explorer;
  var init_explorer = __esm({
    "graphql/explorer.js"() {
      init_nearText();
      init_nearVector();
      init_nearObject();
      init_nearImage();
      init_ask();
      init_kinds();
      Explorer = class {
        constructor(client) {
          this.client = client;
          this.params = {};
          this.errors = [];
        }
        withFields = (fields) => {
          this.fields = fields;
          return this;
        };
        withLimit = (limit) => {
          this.limit = limit;
          return this;
        };
        withNearText = (nearTextObj) => {
          try {
            this.nearTextString = new GraphQLNearText(nearTextObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearObject = (nearObjectObj) => {
          try {
            this.nearObjectString = new GraphQLNearObject(nearObjectObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withAsk = (askObj) => {
          try {
            this.askString = new GraphQLAsk(askObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearImage = (nearImageObj) => {
          try {
            this.nearImageString = new GraphQLNearImage(nearImageObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        withNearVector = (nearVectorObj) => {
          try {
            this.nearVectorString = new GraphQLNearVector(nearVectorObj).toString();
          } catch (e) {
            this.errors = [...this.errors, e];
          }
          return this;
        };
        validateGroup = () => {
          if (!this.group) {
            return;
          }
          if (!Array.isArray(this.group)) {
            throw new Error("groupBy must be an array");
          }
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validateKind = () => {
          try {
            validateKind(this.kind);
          } catch (e) {
            this.errors = [...this.errors, e.toString()];
          }
        };
        validate = () => {
          this.validateIsSet(this.fields, "fields", ".withFields(fields)");
        };
        do = () => {
          let params = "";
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          let args = [];
          if (this.nearTextString) {
            args = [...args, `nearText:${this.nearTextString}`];
          }
          if (this.nearObjectString) {
            args = [...args, `nearObject:${this.nearObjectString}`];
          }
          if (this.askString) {
            args = [...args, `ask:${this.askString}`];
          }
          if (this.nearImageString) {
            args = [...args, `nearImage:${this.nearImageString}`];
          }
          if (this.nearVectorString) {
            args = [...args, `nearVector:${this.nearVectorString}`];
          }
          if (this.limit) {
            args = [...args, `limit:${this.limit}`];
          }
          params = `(${args.join(",")})`;
          return this.client.query(`{Explore${params}{${this.fields}}}`);
        };
      };
    }
  });

  // graphql/index.js
  var graphql, graphql_default;
  var init_graphql = __esm({
    "graphql/index.js"() {
      init_aggregator();
      init_getter();
      init_explorer();
      graphql = (client) => {
        return {
          get: () => new Getter(client),
          aggregate: () => new Aggregator(client),
          explore: () => new Explorer(client)
        };
      };
      graphql_default = graphql;
    }
  });

  // schema/classCreator.js
  var ClassCreator;
  var init_classCreator = __esm({
    "schema/classCreator.js"() {
      init_kinds();
      ClassCreator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withClass = (classObj) => {
          this.class = classObj;
          return this;
        };
        validateClass = () => {
          if (this.class == void 0 || this.class == null) {
            this.errors = [
              ...this.errors,
              "class object must be set - set with .withClass(class)"
            ];
          }
        };
        validate = () => {
          this.validateClass();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/schema`;
          return this.client.post(path, this.class);
        };
      };
    }
  });

  // schema/classDeleter.js
  var ClassDeleter;
  var init_classDeleter = __esm({
    "schema/classDeleter.js"() {
      init_kinds();
      ClassDeleter = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with .withClassName(className)"
            ];
          }
        };
        validate = () => {
          this.validateClassName();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/schema/${this.className}`;
          return this.client.delete(path);
        };
      };
    }
  });

  // schema/propertyCreator.js
  var ClassCreator2;
  var init_propertyCreator = __esm({
    "schema/propertyCreator.js"() {
      init_kinds();
      ClassCreator2 = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withProperty = (property) => {
          this.property = property;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with .withClassName(className)"
            ];
          }
        };
        validateProperty = () => {
          if (this.property == void 0 || this.property == null || this.property.length == 0) {
            this.errors = [
              ...this.errors,
              "property must be set - set with .withProperty(property)"
            ];
          }
        };
        validate = () => {
          this.validateClassName();
          this.validateProperty();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/schema/${this.className}/properties`;
          return this.client.post(path, this.property);
        };
      };
    }
  });

  // schema/getter.js
  var Getter2;
  var init_getter2 = __esm({
    "schema/getter.js"() {
      Getter2 = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        do = () => {
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/schema`;
          return this.client.get(path);
        };
      };
    }
  });

  // schema/index.js
  var schema, schema_default;
  var init_schema = __esm({
    "schema/index.js"() {
      init_classCreator();
      init_classDeleter();
      init_propertyCreator();
      init_getter2();
      schema = (client) => {
        return {
          classCreator: () => new ClassCreator(client),
          classDeleter: () => new ClassDeleter(client),
          getter: () => new Getter2(client),
          propertyCreator: () => new ClassCreator2(client)
        };
      };
      schema_default = schema;
    }
  });

  // data/creator.js
  var Creator;
  var init_creator = __esm({
    "data/creator.js"() {
      Creator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withProperties = (properties) => {
          this.properties = properties;
          return this;
        };
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with .withClassName(className)"
            ];
          }
        };
        payload = () => ({
          properties: this.properties,
          class: this.className,
          id: this.id
        });
        validate = () => {
          this.validateClassName();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects`;
          return this.client.post(path, this.payload());
        };
      };
    }
  });

  // data/validator.js
  var Validator;
  var init_validator = __esm({
    "data/validator.js"() {
      Validator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withProperties = (properties) => {
          this.properties = properties;
          return this;
        };
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with .withClassName(className)"
            ];
          }
        };
        payload = () => ({
          properties: this.properties,
          class: this.className,
          id: this.id
        });
        validate = () => {
          this.validateClassName();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/validate`;
          return this.client.post(path, this.payload(), false).then(() => true);
        };
      };
    }
  });

  // data/updater.js
  var Updater;
  var init_updater = __esm({
    "data/updater.js"() {
      Updater = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withProperties = (properties) => {
          this.properties = properties;
          return this;
        };
        withId = (id) => {
          this.id = id;
          return this;
        };
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with withId(id)"
            ];
          }
        };
        validateId = () => {
          if (this.id == void 0 || this.id == null || this.id.length == 0) {
            this.errors = [
              ...this.errors,
              "id must be set - initialize with updater(id)"
            ];
          }
        };
        payload = () => ({
          properties: this.properties,
          class: this.className,
          id: this.id
        });
        validate = () => {
          this.validateClassName();
          this.validateId();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/${this.id}`;
          return this.client.put(path, this.payload());
        };
      };
    }
  });

  // data/merger.js
  var Merger;
  var init_merger = __esm({
    "data/merger.js"() {
      Merger = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withProperties = (properties) => {
          this.properties = properties;
          return this;
        };
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateClassName = () => {
          if (this.className == void 0 || this.className == null || this.className.length == 0) {
            this.errors = [
              ...this.errors,
              "className must be set - set with withClassName(className)"
            ];
          }
        };
        validateId = () => {
          if (this.id == void 0 || this.id == null || this.id.length == 0) {
            this.errors = [...this.errors, "id must be set - set with withId(id)"];
          }
        };
        payload = () => ({
          properties: this.properties,
          class: this.className,
          id: this.id
        });
        validate = () => {
          this.validateClassName();
          this.validateId();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/${this.id}`;
          return this.client.patch(path, this.payload());
        };
      };
    }
  });

  // data/getter.js
  var Getter3;
  var init_getter3 = __esm({
    "data/getter.js"() {
      Getter3 = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
          this.additionals = [];
        }
        withLimit = (limit) => {
          this.limit = limit;
          return this;
        };
        extendAdditionals = (prop) => {
          this.additionals = [...this.additionals, prop];
          return this;
        };
        withAdditional = (additionalFlag) => this.extendAdditionals(additionalFlag);
        withVector = () => this.extendAdditionals("vector");
        do = () => {
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          let path = `/objects`;
          let params = [];
          if (this.additionals.length > 0) {
            params = [...params, `include=${this.additionals.join(",")}`];
          }
          if (this.limit) {
            params = [...params, `limit=${this.limit}`];
          }
          if (params.length > 0) {
            path += `?${params.join("&")}`;
          }
          return this.client.get(path);
        };
      };
    }
  });

  // data/getterById.js
  var GetterById;
  var init_getterById = __esm({
    "data/getterById.js"() {
      GetterById = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
          this.additionals = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        extendAdditionals = (prop) => {
          this.additionals = [...this.additionals, prop];
          return this;
        };
        extendAdditionals = (prop) => {
          this.additionals = [...this.additionals, prop];
          return this;
        };
        withAdditional = (additionalFlag) => this.extendAdditionals(additionalFlag);
        withVector = () => this.extendAdditionals("vector");
        validateId = () => {
          if (this.id == void 0 || this.id == null || this.id.length == 0) {
            this.errors = [
              ...this.errors,
              "id must be set - initialize with getterById(id)"
            ];
          }
        };
        validate = () => {
          this.validateId();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          let path = `/objects/${this.id}`;
          if (this.additionals.length > 0) {
            path += `?include=${this.additionals.join(",")}`;
          }
          return this.client.get(path);
        };
      };
    }
  });

  // data/deleter.js
  var Deleter;
  var init_deleter = __esm({
    "data/deleter.js"() {
      Deleter = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validateId = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
        };
        validate = () => {
          this.validateId();
        };
        do = () => {
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          this.validate();
          const path = `/objects/${this.id}`;
          return this.client.delete(path);
        };
      };
    }
  });

  // data/referenceCreator.js
  var ReferenceCreator;
  var init_referenceCreator = __esm({
    "data/referenceCreator.js"() {
      ReferenceCreator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        withReference = (ref) => {
          this.reference = ref;
          return this;
        };
        withReferenceProperty = (refProp) => {
          this.refProp = refProp;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
          this.validateIsSet(this.reference, "reference", ".withReference(ref)");
          this.validateIsSet(this.refProp, "referenceProperty", ".withReferenceProperty(refProp)");
        };
        payload = () => this.reference;
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/${this.id}/references/${this.refProp}`;
          return this.client.post(path, this.payload(), false);
        };
      };
    }
  });

  // data/referenceReplacer.js
  var ReferenceReplacer;
  var init_referenceReplacer = __esm({
    "data/referenceReplacer.js"() {
      ReferenceReplacer = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        withReferences = (refs) => {
          this.references = refs;
          return this;
        };
        withReferenceProperty = (refProp) => {
          this.refProp = refProp;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
          this.validateIsSet(this.refProp, "referenceProperty", ".withReferenceProperty(refProp)");
        };
        payload = () => this.references;
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/${this.id}/references/${this.refProp}`;
          return this.client.put(path, this.payload(), false);
        };
      };
    }
  });

  // data/referenceDeleter.js
  var ReferenceDeleter;
  var init_referenceDeleter = __esm({
    "data/referenceDeleter.js"() {
      ReferenceDeleter = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        withReference = (ref) => {
          this.reference = ref;
          return this;
        };
        withReferenceProperty = (refProp) => {
          this.refProp = refProp;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
          this.validateIsSet(this.reference, "reference", ".withReference(ref)");
          this.validateIsSet(this.refProp, "referenceProperty", ".withReferenceProperty(refProp)");
        };
        payload = () => this.reference;
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/objects/${this.id}/references/${this.refProp}`;
          return this.client.delete(path, this.payload(), false);
        };
      };
    }
  });

  // data/referencePayloadBuilder.js
  var ReferencePayloadBuilder;
  var init_referencePayloadBuilder = __esm({
    "data/referencePayloadBuilder.js"() {
      ReferencePayloadBuilder = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
        };
        payload = () => {
          this.validate();
          if (this.errors.length > 0) {
            throw new Error(this.errors.join(", "));
          }
          return {
            beacon: `weaviate://localhost/${this.id}`
          };
        };
      };
    }
  });

  // data/index.js
  var data, data_default;
  var init_data = __esm({
    "data/index.js"() {
      init_creator();
      init_validator();
      init_updater();
      init_merger();
      init_getter3();
      init_getterById();
      init_deleter();
      init_referenceCreator();
      init_referenceReplacer();
      init_referenceDeleter();
      init_referencePayloadBuilder();
      data = (client) => {
        return {
          creator: () => new Creator(client),
          validator: () => new Validator(client),
          updater: () => new Updater(client),
          merger: () => new Merger(client),
          getter: () => new Getter3(client),
          getterById: () => new GetterById(client),
          deleter: () => new Deleter(client),
          referenceCreator: () => new ReferenceCreator(client),
          referenceReplacer: () => new ReferenceReplacer(client),
          referenceDeleter: () => new ReferenceDeleter(client),
          referencePayloadBuilder: () => new ReferencePayloadBuilder(client)
        };
      };
      data_default = data;
    }
  });

  // classifications/getter.js
  var Getter4;
  var init_getter4 = __esm({
    "classifications/getter.js"() {
      Getter4 = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withId = (id) => {
          this.id = id;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validateId = () => {
          this.validateIsSet(this.id, "id", ".withId(id)");
        };
        validate = () => {
          this.validateId();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/classifications/${this.id}`;
          return this.client.get(path);
        };
      };
    }
  });

  // classifications/scheduler.js
  var Scheduler;
  var init_scheduler = __esm({
    "classifications/scheduler.js"() {
      init_getter4();
      Scheduler = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
          this.waitTimeout = 10 * 60 * 1e3;
          this.waitForCompletion = false;
        }
        withType = (type) => {
          this.type = type;
          return this;
        };
        withSettings = (settings) => {
          this.settings = settings;
          return this;
        };
        withClassName = (className) => {
          this.className = className;
          return this;
        };
        withClassifyProperties = (props) => {
          this.classifyProperties = props;
          return this;
        };
        withBasedOnProperties = (props) => {
          this.basedOnProperties = props;
          return this;
        };
        withWaitForCompletion = () => {
          this.waitForCompletion = true;
          return this;
        };
        withWaitTimeout = (timeout) => {
          this.waitTimeout = timeout;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validateClassName = () => {
          this.validateIsSet(this.className, "className", ".withClassName(className)");
        };
        validateBasedOnProperties = () => {
          this.validateIsSet(this.basedOnProperties, "basedOnProperties", ".withBasedOnProperties(basedOnProperties)");
        };
        validateClassifyProperties = () => {
          this.validateIsSet(this.classifyProperties, "classifyProperties", ".withClassifyProperties(classifyProperties)");
        };
        validate = () => {
          this.validateClassName();
          this.validateClassifyProperties();
          this.validateBasedOnProperties();
        };
        payload = () => ({
          type: this.type,
          settings: this.settings,
          class: this.className,
          classifyProperties: this.classifyProperties,
          basedOnProperties: this.basedOnProperties
        });
        pollForCompletion = (id) => {
          return new Promise((resolve, reject) => {
            setTimeout(() => reject(new Error("classification didn't finish within configured timeout, set larger timeout with .withWaitTimeout(timeout)")), this.waitTimeout);
            setInterval(() => {
              new Getter4(this.client).withId(id).do().then((res) => {
                res.status == "completed" && resolve(res);
              });
            }, 500);
          });
        };
        do = () => {
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          this.validate();
          const path = `/classifications`;
          return this.client.post(path, this.payload()).then((res) => {
            if (!this.waitForCompletion) {
              return Promise.resolve(res);
            }
            return this.pollForCompletion(res.id);
          });
        };
      };
    }
  });

  // classifications/index.js
  var data2, classifications_default;
  var init_classifications = __esm({
    "classifications/index.js"() {
      init_scheduler();
      init_getter4();
      data2 = (client) => {
        return {
          scheduler: () => new Scheduler(client),
          getter: () => new Getter4(client)
        };
      };
      classifications_default = data2;
    }
  });

  // batch/objectsBatcher.js
  var ObjectsBatcher;
  var init_objectsBatcher = __esm({
    "batch/objectsBatcher.js"() {
      ObjectsBatcher = class {
        constructor(client) {
          this.client = client;
          this.objects = [];
          this.errors = [];
        }
        withObject = (obj) => {
          this.objects = [...this.objects, obj];
          return this;
        };
        payload = () => ({
          objects: this.objects
        });
        validateObjectCount = () => {
          if (this.objects.length == 0) {
            this.errors = [
              ...this.errors,
              "need at least one object to send a request, add one with .withObject(obj)"
            ];
          }
        };
        validate = () => {
          this.validateObjectCount();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/batch/objects`;
          return this.client.post(path, this.payload());
        };
      };
    }
  });

  // batch/referencesBatcher.js
  var ReferencesBatcher;
  var init_referencesBatcher = __esm({
    "batch/referencesBatcher.js"() {
      ReferencesBatcher = class {
        constructor(client) {
          this.client = client;
          this.references = [];
          this.errors = [];
        }
        withReference = (obj) => {
          this.references = [...this.references, obj];
          return this;
        };
        payload = () => this.references;
        validateReferenceCount = () => {
          if (this.references.length == 0) {
            this.errors = [
              ...this.errors,
              "need at least one reference to send a request, add one with .withReference(obj)"
            ];
          }
        };
        validate = () => {
          this.validateReferenceCount();
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/batch/references`;
          return this.client.post(path, this.payload());
        };
      };
    }
  });

  // batch/referencePayloadBuilder.js
  var ReferencesBatcher2;
  var init_referencePayloadBuilder2 = __esm({
    "batch/referencePayloadBuilder.js"() {
      ReferencesBatcher2 = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withFromId = (id) => {
          this.fromId = id;
          return this;
        };
        withToId = (id) => {
          this.toId = id;
          return this;
        };
        withFromClassName = (className) => {
          this.fromClassName = className;
          return this;
        };
        withFromRefProp = (refProp) => {
          this.fromRefProp = refProp;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.fromId, "fromId", ".withFromId(id)");
          this.validateIsSet(this.toId, "toId", ".withToId(id)");
          this.validateIsSet(this.fromClassName, "fromClassName", ".withFromClassName(className)");
          this.validateIsSet(this.fromRefProp, "fromRefProp", ".withFromRefProp(refProp)");
        };
        payload = () => {
          this.validate();
          if (this.errors.length > 0) {
            throw new Error(this.errors.join(", "));
          }
          return {
            from: `weaviate://localhost/${this.fromClassName}/${this.fromId}/${this.fromRefProp}`,
            to: `weaviate://localhost/${this.toId}`
          };
        };
      };
    }
  });

  // batch/index.js
  var batch, batch_default;
  var init_batch = __esm({
    "batch/index.js"() {
      init_objectsBatcher();
      init_referencesBatcher();
      init_referencePayloadBuilder2();
      batch = (client) => {
        return {
          objectsBatcher: () => new ObjectsBatcher(client),
          referencesBatcher: () => new ReferencesBatcher(client),
          referencePayloadBuilder: () => new ReferencesBatcher2(client)
        };
      };
      batch_default = batch;
    }
  });

  // misc/liveChecker.js
  var LiveChecker;
  var init_liveChecker = __esm({
    "misc/liveChecker.js"() {
      LiveChecker = class {
        constructor(client) {
          this.client = client;
        }
        do = () => {
          return this.client.get("/.well-known/live", false).then(() => Promise.resolve(true)).catch(() => Promise.resolve(false));
        };
      };
    }
  });

  // misc/readyChecker.js
  var ReadyChecker;
  var init_readyChecker = __esm({
    "misc/readyChecker.js"() {
      ReadyChecker = class {
        constructor(client) {
          this.client = client;
        }
        do = () => {
          return this.client.get("/.well-known/live", false).then(() => Promise.resolve(true)).catch(() => Promise.resolve(false));
        };
      };
    }
  });

  // misc/metaGetter.js
  var MetaGetter;
  var init_metaGetter = __esm({
    "misc/metaGetter.js"() {
      MetaGetter = class {
        constructor(client) {
          this.client = client;
        }
        do = () => {
          return this.client.get("/meta", true);
        };
      };
    }
  });

  // misc/openidConfigurationGetter.js
  var OpenidConfigurationGetterGetter;
  var init_openidConfigurationGetter = __esm({
    "misc/openidConfigurationGetter.js"() {
      OpenidConfigurationGetterGetter = class {
        constructor(client) {
          this.client = client;
        }
        do = () => {
          return this.client.getRaw("/.well-known/openid-configuration").then((res) => {
            if (res.status < 400) {
              return res.json();
            }
            if (res.status == 404) {
              return Promise.resolve(void 0);
            }
            return Promise.reject(new Error(`unexpected status code: ${res.status}`));
          });
        };
      };
    }
  });

  // misc/index.js
  var misc, misc_default;
  var init_misc = __esm({
    "misc/index.js"() {
      init_liveChecker();
      init_readyChecker();
      init_metaGetter();
      init_openidConfigurationGetter();
      misc = (client) => {
        return {
          liveChecker: () => new LiveChecker(client),
          readyChecker: () => new ReadyChecker(client),
          metaGetter: () => new MetaGetter(client),
          openidConfigurationGetter: () => new OpenidConfigurationGetterGetter(client)
        };
      };
      misc_default = misc;
    }
  });

  // c11y/extensionCreator.js
  var ExtensionCreator;
  var init_extensionCreator = __esm({
    "c11y/extensionCreator.js"() {
      ExtensionCreator = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        withConcept = (concept) => {
          this.concept = concept;
          return this;
        };
        withDefinition = (definition) => {
          this.definition = definition;
          return this;
        };
        withWeight = (weight) => {
          this.weight = weight;
          return this;
        };
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        validate = () => {
          this.validateIsSet(this.concept, "concept", "withConcept(concept)");
          this.validateIsSet(this.definition, "definition", "withDefinition(definition)");
          this.validateIsSet(this.weight, "weight", "withWeight(weight)");
        };
        payload = () => ({
          concept: this.concept,
          definition: this.definition,
          weight: this.weight
        });
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/modules/text2vec-contextionary/extensions`;
          return this.client.post(path, this.payload());
        };
      };
    }
  });

  // c11y/conceptsGetter.js
  var ConceptsGetter;
  var init_conceptsGetter = __esm({
    "c11y/conceptsGetter.js"() {
      ConceptsGetter = class {
        constructor(client) {
          this.client = client;
          this.errors = [];
        }
        validateIsSet = (prop, name, setter) => {
          if (prop == void 0 || prop == null || prop.length == 0) {
            this.errors = [
              ...this.errors,
              `${name} must be set - set with ${setter}`
            ];
          }
        };
        withConcept = (concept) => {
          this.concept = concept;
          return this;
        };
        validate = () => {
          this.validateIsSet(this.concept, "concept", "withConcept(concept)");
        };
        do = () => {
          this.validate();
          if (this.errors.length > 0) {
            return Promise.reject(new Error("invalid usage: " + this.errors.join(", ")));
          }
          const path = `/modules/text2vec-contextionary/concepts/${this.concept}`;
          return this.client.get(path);
        };
      };
    }
  });

  // c11y/index.js
  var c11y, c11y_default;
  var init_c11y = __esm({
    "c11y/index.js"() {
      init_extensionCreator();
      init_conceptsGetter();
      c11y = (client) => {
        return {
          conceptsGetter: () => new ConceptsGetter(client),
          extensionCreator: () => new ExtensionCreator(client)
        };
      };
      c11y_default = c11y;
    }
  });

  // node_modules/whatwg-fetch/dist/fetch.umd.js
  var require_fetch_umd = __commonJS({
    "node_modules/whatwg-fetch/dist/fetch.umd.js"(exports, module) {
      (function(global, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global.WHATWGFetch = {});
      })(exports, function(exports2) {
        "use strict";
        var global = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || typeof global !== "undefined" && global;
        var support = {
          searchParams: "URLSearchParams" in global,
          iterable: "Symbol" in global && "iterator" in Symbol,
          blob: "FileReader" in global && "Blob" in global && function() {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          }(),
          formData: "FormData" in global,
          arrayBuffer: "ArrayBuffer" in global
        };
        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }
        if (support.arrayBuffer) {
          var viewClasses = [
            "[object Int8Array]",
            "[object Uint8Array]",
            "[object Uint8ClampedArray]",
            "[object Int16Array]",
            "[object Uint16Array]",
            "[object Int32Array]",
            "[object Uint32Array]",
            "[object Float32Array]",
            "[object Float64Array]"
          ];
          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }
        function normalizeName(name) {
          if (typeof name !== "string") {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
            throw new TypeError("Invalid character in header field name");
          }
          return name.toLowerCase();
        }
        function normalizeValue(value) {
          if (typeof value !== "string") {
            value = String(value);
          }
          return value;
        }
        function iteratorFor(items) {
          var iterator = {
            next: function() {
              var value = items.shift();
              return { done: value === void 0, value };
            }
          };
          if (support.iterable) {
            iterator[Symbol.iterator] = function() {
              return iterator;
            };
          }
          return iterator;
        }
        function Headers2(headers) {
          this.map = {};
          if (headers instanceof Headers2) {
            headers.forEach(function(value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name]);
            }, this);
          }
        }
        Headers2.prototype.append = function(name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ", " + value : value;
        };
        Headers2.prototype["delete"] = function(name) {
          delete this.map[normalizeName(name)];
        };
        Headers2.prototype.get = function(name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };
        Headers2.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };
        Headers2.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };
        Headers2.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };
        Headers2.prototype.keys = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };
        Headers2.prototype.values = function() {
          var items = [];
          this.forEach(function(value) {
            items.push(value);
          });
          return iteratorFor(items);
        };
        Headers2.prototype.entries = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };
        if (support.iterable) {
          Headers2.prototype[Symbol.iterator] = Headers2.prototype.entries;
        }
        function consumed(body) {
          if (body.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
          }
          body.bodyUsed = true;
        }
        function fileReaderReady(reader) {
          return new Promise(function(resolve, reject) {
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = function() {
              reject(reader.error);
            };
          });
        }
        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }
        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsText(blob);
          return promise;
        }
        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);
          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
          }
          return chars.join("");
        }
        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }
        function Body() {
          this.bodyUsed = false;
          this._initBody = function(body) {
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;
            if (!body) {
              this._bodyText = "";
            } else if (typeof body === "string") {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer);
              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get("content-type")) {
              if (typeof body === "string") {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
              }
            }
          };
          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }
              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error("could not read FormData body as blob");
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };
            this.arrayBuffer = function() {
              if (this._bodyArrayBuffer) {
                var isConsumed = consumed(this);
                if (isConsumed) {
                  return isConsumed;
                }
                if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                  return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
                } else {
                  return Promise.resolve(this._bodyArrayBuffer);
                }
              } else {
                return this.blob().then(readBlobAsArrayBuffer);
              }
            };
          }
          this.text = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as text");
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode);
            };
          }
          this.json = function() {
            return this.text().then(JSON.parse);
          };
          return this;
        }
        var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];
        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }
        function Request2(input, options) {
          if (!(this instanceof Request2)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          options = options || {};
          var body = options.body;
          if (input instanceof Request2) {
            if (input.bodyUsed) {
              throw new TypeError("Already read");
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers2(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }
          this.credentials = options.credentials || this.credentials || "same-origin";
          if (options.headers || !this.headers) {
            this.headers = new Headers2(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || "GET");
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal;
          this.referrer = null;
          if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
          }
          this._initBody(body);
          if (this.method === "GET" || this.method === "HEAD") {
            if (options.cache === "no-store" || options.cache === "no-cache") {
              var reParamSearch = /([?&])_=[^&]*/;
              if (reParamSearch.test(this.url)) {
                this.url = this.url.replace(reParamSearch, "$1_=" + new Date().getTime());
              } else {
                var reQueryString = /\?/;
                this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + new Date().getTime();
              }
            }
          }
        }
        Request2.prototype.clone = function() {
          return new Request2(this, { body: this._bodyInit });
        };
        function decode(body) {
          var form = new FormData();
          body.trim().split("&").forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split("=");
              var name = split.shift().replace(/\+/g, " ");
              var value = split.join("=").replace(/\+/g, " ");
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }
        function parseHeaders(rawHeaders) {
          var headers = new Headers2();
          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
          preProcessedHeaders.split(/\r?\n/).forEach(function(line) {
            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
              var value = parts.join(":").trim();
              headers.append(key, value);
            }
          });
          return headers;
        }
        Body.call(Request2.prototype);
        function Response(bodyInit, options) {
          if (!(this instanceof Response)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          if (!options) {
            options = {};
          }
          this.type = "default";
          this.status = options.status === void 0 ? 200 : options.status;
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = "statusText" in options ? options.statusText : "";
          this.headers = new Headers2(options.headers);
          this.url = options.url || "";
          this._initBody(bodyInit);
        }
        Body.call(Response.prototype);
        Response.prototype.clone = function() {
          return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers2(this.headers),
            url: this.url
          });
        };
        Response.error = function() {
          var response = new Response(null, { status: 0, statusText: "" });
          response.type = "error";
          return response;
        };
        var redirectStatuses = [301, 302, 303, 307, 308];
        Response.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
          }
          return new Response(null, { status, headers: { location: url } });
        };
        exports2.DOMException = global.DOMException;
        try {
          new exports2.DOMException();
        } catch (err) {
          exports2.DOMException = function(message, name) {
            this.message = message;
            this.name = name;
            var error = Error(message);
            this.stack = error.stack;
          };
          exports2.DOMException.prototype = Object.create(Error.prototype);
          exports2.DOMException.prototype.constructor = exports2.DOMException;
        }
        function fetch2(input, init) {
          return new Promise(function(resolve, reject) {
            var request = new Request2(input, init);
            if (request.signal && request.signal.aborted) {
              return reject(new exports2.DOMException("Aborted", "AbortError"));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
              xhr.abort();
            }
            xhr.onload = function() {
              var options = {
                status: xhr.status,
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || "")
              };
              options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
              var body = "response" in xhr ? xhr.response : xhr.responseText;
              setTimeout(function() {
                resolve(new Response(body, options));
              }, 0);
            };
            xhr.onerror = function() {
              setTimeout(function() {
                reject(new TypeError("Network request failed"));
              }, 0);
            };
            xhr.ontimeout = function() {
              setTimeout(function() {
                reject(new TypeError("Network request failed"));
              }, 0);
            };
            xhr.onabort = function() {
              setTimeout(function() {
                reject(new exports2.DOMException("Aborted", "AbortError"));
              }, 0);
            };
            function fixUrl(url) {
              try {
                return url === "" && global.location.href ? global.location.href : url;
              } catch (e) {
                return url;
              }
            }
            xhr.open(request.method, fixUrl(request.url), true);
            if (request.credentials === "include") {
              xhr.withCredentials = true;
            } else if (request.credentials === "omit") {
              xhr.withCredentials = false;
            }
            if ("responseType" in xhr) {
              if (support.blob) {
                xhr.responseType = "blob";
              } else if (support.arrayBuffer && request.headers.get("Content-Type") && request.headers.get("Content-Type").indexOf("application/octet-stream") !== -1) {
                xhr.responseType = "arraybuffer";
              }
            }
            if (init && typeof init.headers === "object" && !(init.headers instanceof Headers2)) {
              Object.getOwnPropertyNames(init.headers).forEach(function(name) {
                xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
              });
            } else {
              request.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value);
              });
            }
            if (request.signal) {
              request.signal.addEventListener("abort", abortXhr);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  request.signal.removeEventListener("abort", abortXhr);
                }
              };
            }
            xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
          });
        }
        fetch2.polyfill = true;
        if (!global.fetch) {
          global.fetch = fetch2;
          global.Headers = Headers2;
          global.Request = Request2;
          global.Response = Response;
        }
        exports2.Headers = Headers2;
        exports2.Request = Request2;
        exports2.Response = Response;
        exports2.fetch = fetch2;
        Object.defineProperty(exports2, "__esModule", { value: true });
      });
    }
  });

  // node_modules/isomorphic-fetch/fetch-npm-browserify.js
  var require_fetch_npm_browserify = __commonJS({
    "node_modules/isomorphic-fetch/fetch-npm-browserify.js"(exports, module) {
      require_fetch_umd();
      module.exports = self.fetch.bind(self);
    }
  });

  // node_modules/graphql-client/index.js
  var require_graphql_client = __commonJS({
    "node_modules/graphql-client/index.js"(exports, module) {
      function highlightQuery(query, errors) {
        var locations = errors.map(function(e) {
          return e.locations;
        }).reduce(function(a, b) {
          return a.concat(b);
        }, []);
        var queryHighlight = "";
        query.split("\n").forEach(function(row, index) {
          var line = index + 1;
          var lineErrors = locations.filter(function(loc) {
            return loc && loc.line === line;
          });
          queryHighlight += row + "\n";
          if (lineErrors.length) {
            var errorHighlight = [];
            lineErrors.forEach(function(line2) {
              for (var i2 = 0; i2 < 8; i2++) {
                errorHighlight[line2.column + i2] = "~";
              }
            });
            for (var i = 0; i < errorHighlight.length; i++) {
              queryHighlight += errorHighlight[i] || " ";
            }
            queryHighlight += "\n";
          }
        });
        return queryHighlight;
      }
      module.exports = function(params) {
        require_fetch_npm_browserify();
        if (!params.url)
          throw new Error("Missing url parameter");
        var headers = new Headers(params.headers);
        headers.append("Content-Type", "application/json");
        return {
          query: function(query, variables, onResponse) {
            var req = new Request(params.url, {
              method: "POST",
              body: JSON.stringify({
                query,
                variables
              }),
              headers,
              credentials: params.credentials
            });
            return fetch(req).then(function(res) {
              onResponse && onResponse(req, res);
              return res.json();
            }).then(function(body) {
              if (body.errors && body.errors.length) {
                body.highlightQuery = highlightQuery(query, body.errors);
              }
              return body;
            });
          }
        };
      };
    }
  });

  // httpClient.js
  var require_httpClient = __commonJS({
    "httpClient.js"(exports, module) {
      var fetch2 = require_fetch_npm_browserify();
      var client = (config) => {
        const url = makeUrl(config.baseUri);
        return {
          post: (path, payload, expectReturnContent = true) => {
            return fetch2(url(path), {
              method: "POST",
              headers: {
                ...config.headers,
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            }).then(makeCheckStatus(expectReturnContent));
          },
          put: (path, payload, expectReturnContent = true) => {
            return fetch2(url(path), {
              method: "PUT",
              headers: {
                ...config.headers,
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            }).then(makeCheckStatus(expectReturnContent));
          },
          patch: (path, payload) => {
            return fetch2(url(path), {
              method: "PATCH",
              headers: {
                ...config.headers,
                "content-type": "application/json"
              },
              body: JSON.stringify(payload)
            }).then(makeCheckStatus(false));
          },
          delete: (path, payload) => {
            return fetch2(url(path), {
              method: "DELETE",
              headers: {
                ...config.headers,
                "content-type": "application/json"
              },
              body: payload ? JSON.stringify(payload) : void 0
            }).then(makeCheckStatus(false));
          },
          get: (path, expectReturnContent = true) => {
            return fetch2(url(path), {
              method: "GET",
              headers: {
                ...config.headers
              }
            }).then(makeCheckStatus(expectReturnContent));
          },
          getRaw: (path) => {
            return fetch2(url(path), {
              method: "GET",
              headers: {
                ...config.headers
              }
            });
          }
        };
      };
      var makeUrl = (basePath) => (path) => basePath + path;
      var makeCheckStatus = (expectResponseBody) => (res) => {
        if (res.status >= 400 && res.status < 500) {
          return res.json().then((err) => {
            return Promise.reject(`usage error (${res.status}): ${JSON.stringify(err)}`);
          });
        }
        if (res.status >= 500) {
          return res.json().then((err) => {
            return Promise.reject(`usage error (${res.status}): ${JSON.stringify(err)}`);
          });
        }
        if (expectResponseBody) {
          return res.json();
        }
      };
      module.exports = client;
    }
  });

  // index.js
  var require_weaviate_javascript_client = __commonJS({
    "index.js"(exports, module) {
      init_graphql();
      init_schema();
      init_data();
      init_classifications();
      init_batch();
      init_misc();
      init_c11y();
      init_kinds();
      var app = {
        client: function(params) {
          if (!params.host)
            throw new Error("Missing `host` parameter");
          if (!params.scheme)
            throw new Error("Missing `scheme` parameter");
          if (!params.headers)
            params.headers = {};
          const graphqlClient = require_graphql_client()({
            url: params.scheme + "://" + params.host + "/v1/graphql",
            headers: params.headers
          });
          const httpClient = require_httpClient()({
            baseUri: params.scheme + "://" + params.host + "/v1",
            headers: params.headers
          });
          return {
            graphql: graphql_default(graphqlClient),
            schema: schema_default(httpClient),
            data: data_default(httpClient),
            classifications: classifications_default(httpClient),
            batch: batch_default(httpClient),
            misc: misc_default(httpClient),
            c11y: c11y_default(httpClient)
          };
        },
        KIND_THINGS,
        KIND_ACTIONS
      };
      module.exports = app;
      weaviate = app;
    }
  });
  require_weaviate_javascript_client();
})();
