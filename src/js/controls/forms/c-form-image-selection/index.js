/*jslint node: true, nomen: true */
"use strict";

var ko = require('knockout'),
    Promise = require('bluebird');
    function isFunction(functionToCheck) {
     var getType = {};
     return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

function ViewModel(params) {
    var self = this;
    self.context = params.context;
    self.status = ko.observable('');
    self.fields = ko.observable({});
    self.errors = ko.observable({});

    self.trigger = function (id) {
        self.context.events[id](self.context, self.output);
    };
    this.imgSrc  = ko.computed(function() {
        if (self.fields() && isFunction(self.fields().image)){
        return 'http://awt.westus.cloudapp.azure.com:4000' + self.fields().image();
      }
      else{
        return "error.png";
      }
    }, this);

}

ViewModel.prototype.id = 'form-image-selection';

ViewModel.prototype.waitForStatusChange = function () {
    return this._initializing ||
           Promise.resolve();
};

ViewModel.prototype._compute = function () {
    this.output = {
        'image': this.input['image'],
        'selected': this.input['selected'],
        'session': this.input['session'],
        'size': this.input['size'],
        'type': this.input['type'],
    }
    var self = this,
        fields = {
            'image': ko.observable(this.input['image']),
            'selected': ko.observable(this.input['selected']),
            'session': ko.observable(this.input['session']),
            'size': ko.observable(this.input['size']),
            'type': ko.observable(this.input['type']),
        },
        errors = {
            'image': ko.observable(this.input['image-error']),
            'selected': ko.observable(this.input['selected-error']),
            'session': ko.observable(this.input['session-error']),
            'size': ko.observable(this.input['size-error']),
            'type': ko.observable(this.input['type-error']),
        };
    fields['image'].subscribe(function (value) {
        self.output['image'] = value;
        self.errors()['image'](undefined);

    });
    fields['selected'].subscribe(function (value) {
        self.output['selected'] = value;
        self.errors()['selected'](undefined);
    });
    fields['session'].subscribe(function (value) {
        self.output['session'] = value;
        self.errors()['session'](undefined);
        self.context.actions['worker-load-next-selection']({filters: {session : value}});
    });
    fields['size'].subscribe(function (value) {
        self.output['size'] = value;
        self.errors()['size'](undefined);
    });
    fields['type'].subscribe(function (value) {
        self.output['type'] = value;
        self.errors()['type'](undefined);
    });
    this.fields(fields);
    this.errors(errors);
    this.status('computed');
};


ViewModel.prototype.init = function (options) {
    options = options || {};
    this.output = undefined;
    this.fields({});
    this.errors({});
    this.input = options.input || {};
    this.status('ready');
    var self = this;
    this._initializing = new Promise(function (resolve) {
        setTimeout(function () {
            self._compute();
            resolve();
            self._initializing = undefined;
        }, 1);
    });
};

exports.register = function () {
    ko.components.register('c-form-image-selection', {
        viewModel: {
            createViewModel: function (params, componentInfo) {
                var vm = new ViewModel(params);
                params.context.vms[vm.id] = vm;
                ko.utils.domNodeDisposal.addDisposeCallback(componentInfo.element, function () { delete params.context.vms[vm.id]; });
                return vm;
            }
        },
        template: require('./index.html'),
        synchronous: true
    });
};
