var idgenerator = 0;

function getId() {
    return (idgenerator++).toString(36);
}

function View(model) {
    var view = this;
    this.id = getId();
    this.model = model;
    eve.on(model.id + ".updated", function () {
        view.update(model);
    });
}
View.prototype.update = function () {};


function Model() {
    this.id = getId();
    eve.on(model.id + ".change", function () {});
}
Model.prototype.update = function () {
    eve(this.id + ".updated");
};

function Controller() {
    this.id = getId();
}