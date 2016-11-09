var formioUtils = require('formio-utils');

module.exports = function() {
  var boolean = {
    'true': true,
    'false': false
  };
  return {
    /* eslint-disable no-unused-vars */
    checkConditions: function(cond, data) {
    /* eslint-enable no-unused-vars */
      var result = true;
      var value = this.getValue({data: data}, cond.when);
      if (typeof value !== 'undefined' && typeof value !== 'object') {
        // Check if the conditional value is equal to the trigger value
        result = value.toString() === cond.eq.toString()
          ? boolean[cond.show]
          : !boolean[cond.show];
      }
      // Special check for check boxes component.
      else if (typeof value !== 'undefined' && typeof value === 'object') {
        // Only update the visibility is present, otherwise hide, because it was deleted by the submission sweep.
        if (value.hasOwnProperty(cond.eq)) {
          result = boolean.hasOwnProperty(value[cond.eq])
            ? boolean[value[cond.eq]]
            : true;
        }
        else {
          result = false;
        }
      }
      // Check against the components default value, if present and the components hasn't been interacted with.
      else if (typeof value === 'undefined' && cond.hasOwnProperty('defaultValue')) {
        result = cond.defaultValue.toString() === cond.eq.toString()
          ? boolean[cond.show]
          : !boolean[cond.show];
      }
      // If there is no value, we still need to process as not equal.
      else {
        result = !boolean[cond.show];
      }
      return result;
    },
    /* eslint-disable no-unused-vars */
    checkCustomConditions: function(conditional, data) {
    /* eslint-enable no-unused-vars */
      if (!conditional) {
        return true;
      }
      var result = true;
      try {
        var show = eval('(function() { ' + conditional.toString() + '; return show; })()');
        result = boolean.hasOwnProperty(show.toString()) ? boolean[show] : true;
      }
      catch (e) {
        result = true;
      }
      return result;
    },
    flattenComponents: formioUtils.flattenComponents,
    eachComponent: formioUtils.eachComponent,
    getComponent: formioUtils.getComponent,
    getValue: formioUtils.getValue,
    hideFields: function(form, components) {
      this.eachComponent(form.components, function(component) {
        for (var i in components) {
          if (component.key === components[i]) {
            component.type = 'hidden';
          }
        }
      });
    },
    uniqueName: function(name) {
      var parts = name.toLowerCase().replace(/[^0-9a-z\.]/g, '').split('.');
      var fileName = parts[0];
      var ext = '';
      if (parts.length > 1) {
        ext = '.' + parts[(parts.length - 1)];
      }
      return fileName.substr(0, 10) + '-' + this.guid() + ext;
    },
    guid: function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      });
    },
    fieldWrap: function(input) {
      input = input + '<formio-errors></formio-errors>';
      var multiInput = input.replace('data[component.key]', 'data[component.key][$index]');
      var inputLabel = '<label ng-if="component.label && !component.hideLabel" for="{{ component.key }}" class="control-label" ng-class="{\'field-required\': component.validate.required}">{{ component.label | formioTranslate }}</label>';
      var requiredInline = '<span ng-if="(component.hideLabel === true || component.label === \'\' || !component.label) && component.validate.required" class="glyphicon glyphicon-asterisk form-control-feedback field-required-inline" aria-hidden="true"></span>';
      var template =
        '<div ng-if="!component.multiple">' +
          inputLabel +
          '<div class="input-group">' +
            '<div class="input-group-addon" ng-if="!!component.prefix">{{ component.prefix }}</div>' +
            input +
            requiredInline +
            '<div class="input-group-addon" ng-if="!!component.suffix">{{ component.suffix }}</div>' +
          '</div>' +
        '</div>' +
        '<div ng-if="component.multiple"><table class="table table-bordered">' +
          inputLabel +
          '<tr ng-repeat="value in data[component.key] track by $index">' +
            '<td>' +
              '<div class="input-group">' +
                '<div class="input-group-addon" ng-if="!!component.prefix">{{ component.prefix }}</div>' +
                  multiInput +
                  requiredInline +
                '<div class="input-group-addon" ng-if="!!component.suffix">{{ component.suffix }}</div>' +
              '</div>' +
            '</td>' +
            '<td><a ng-click="removeFieldValue($index)" class="btn btn-default"><span class="glyphicon glyphicon-remove-circle"></span></a></td>' +
          '</tr>' +
          '<tr>' +
            '<td colspan="2"><a ng-click="addFieldValue()" class="btn btn-primary"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span> {{ component.addAnother || "Add Another" | formioTranslate }}</a></td>' +
          '</tr>' +
        '</table></div>';
      return template;
    }
  };
};
