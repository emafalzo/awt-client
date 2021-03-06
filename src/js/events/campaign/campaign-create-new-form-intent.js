/*jslint node: true, nomen: true */
"use strict";

exports.createEvent = function () { // add "options" parameter if needed
    return function (context, data) {
        data = data || {};
        var packet = {
            'annotation_replica' : data['Annotation Replica']
            ,'annotation_size' : data['Annotation Size']
            ,'name' : data['Name']
            ,'selection_replica' : data['Selection Replica']
            ,'threshold' : data['Threshold']
        };
        var promise = context.actions['campaign-create-new']({filters: packet});
        context.runningActionsByContainer['view-container-new-campaign'].push(promise);
        promise.then(function (result) {
            context.runningActionsByContainer['view-container-new-campaign'].splice(
                context.runningActionsByContainer['view-container-new-campaign'].indexOf(promise), 1
            );
            if (result.event) {
                context.events[result.event](context, result.data);
            }
        });
    };
};
