/*jslint node: true, nomen: true */
"use strict";

var ko = require('knockout'),
    Promise = require('bluebird');

function ViewModel(params) {
    var self = this;
    self.context = params.context;
    self.status = ko.observable('');
    self.fields = ko.observable({});
    self.errors = ko.observable({});

    self.trigger = function (id) {
        self.context.events[id](self.context, self.output);
    };
}

ViewModel.prototype.id = 'form-user-registration';

ViewModel.prototype.waitForStatusChange = function () {
    return this._initializing ||
           Promise.resolve();
};

ViewModel.prototype._compute = function () {
    this.output = {
        'Fullname': this.input['Fullname'],
        'Password': this.input['Password'],
        'Type': this.input['Type'],
        'Username': this.input['Username'],
    }
    var self = this,
        fields = {
            'Fullname': ko.observable(this.input['Fullname']),
            'Password': ko.observable(this.input['Password']),
            'Type': ko.observable(this.input['Type']),
            'Username': ko.observable(this.input['Username']),
        },
        errors = {
            'Fullname': ko.observable(this.input['Fullname-error']),
            'Password': ko.observable(this.input['Password-error']),
            'Type': ko.observable(this.input['Type-error']),
            'Username': ko.observable(this.input['Username-error']),
        };
    fields['Fullname'].subscribe(function (value) {
        self.output['Fullname'] = value;
        self.errors()['Fullname'](undefined);
    });
    fields['Password'].subscribe(function (value) {
        self.output['Password'] = value;
        self.errors()['Password'](undefined);
    });
    fields['Type'].subscribe(function (value) {
        self.output['Type'] = value;
        self.errors()['Type'](undefined);
    });
    fields['Username'].subscribe(function (value) {
        self.output['Username'] = value;
        self.errors()['Username'](undefined);
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
    ko.components.register('c-form-user-registration', {
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
