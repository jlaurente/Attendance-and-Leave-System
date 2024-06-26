app.directive('fileModel', ['$parse', function ($parse) {
  return {
     restrict: 'A',
     link: function(scope, element, attrs) {
        element.bind('change', function(){
        $parse(attrs.fileModel).assign(scope,element[0].files)
           scope.$apply();
        });
     }
  };
}]);

app.directive('focus', function() {
    return function(scope, element) {
        element[0].focus();
    }      
});
app.directive('capitalize', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
          if (inputValue == undefined) inputValue = '';
          var capitalized = inputValue.toUpperCase();
          if (capitalized !== inputValue) {
            // see where the cursor is before the update so that we can set it back
            var selection = element[0].selectionStart;
            modelCtrl.$setViewValue(capitalized);
            modelCtrl.$render();
            // set back the cursor after rendering
            element[0].selectionStart = selection;
            element[0].selectionEnd = selection;
          }
          return capitalized;
        }
        modelCtrl.$parsers.push(capitalize);
        capitalize(scope[attrs.ngModel]); // capitalize initial value
      }
    };
});
app.directive('numbersOnly', function () {
  return {
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
          function fromUser(text) {
              if (text) {
                  var transformedInput = text.replace(/[^0-9-]/g, '');
                  if (transformedInput !== text) {
                      ngModelCtrl.$setViewValue(transformedInput);
                      ngModelCtrl.$render();
                  }
                  return transformedInput;
              }
              return undefined;
          }
          ngModelCtrl.$parsers.push(fromUser);
      }
  };
});
app.directive('exportTable', function(){
  var link = function ($scope, elm, attr) {
    $scope.$on('export-pdf', function (e, d) {
        elm.tableExport({ type: 'pdf', escape: false });
    });
    $scope.$on('export-excel', function (e, d) {
        elm.tableExport({ type: 'excel', escape: false });
    });
    $scope.$on('export-doc', function (e, d) {
        elm.tableExport({ type: 'doc', escape: false });
    });
    $scope.$on('export-csv', function (e, d) {
        elm.tableExport({ type: 'csv', escape: false });
    });
  }
  return {
      restrict: 'C',
      link: link
  }
});
app.directive('datetimez', function(){
    return {
        require: '?ngModel',
        restrict: 'A',
        link: function(scope, element, attrs, ngModel){
            if(!ngModel) return;  
          
            ngModel.$render = function(){
                element.val( ngModel.$viewValue || '' );
            };
          
            function read() {
                var value = element.val();
                ngModel.$setViewValue(value);
                //console.log(scope.dueDate);
            }
            
            var options = scope.$eval(attrs.datetimez) || {};
            if(element.next().is('.input-group-addon')) {
              var parentElm = $(element).parent();
              parentElm.datetimepicker(options);
          
              parentElm.on('dp.change', function(){
                 scope.$apply(read);
              });
            } else {
              element.datetimepicker(options);
          
              element.on('dp.change', function(){
                 scope.$apply(read);
              });
            }
          
            read();
        }
    };
});
app.directive('psDatetimePicker', function () {
    var format = 'DD-MMM-YY';
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attributes, ctrl) {
            element.datetimepicker({
                format: format
            });
            var picker = element.data("DateTimePicker");

            ctrl.$formatters.push(function (value) {
                var date = moment(value);
                if (date.isValid()) {
                    return date.format(format);
                }
                return '';
            });

            element.on('change', function (event) {
                scope.$apply(function() {
                    var date = picker.getDate();
                    ctrl.$setViewValue(date.valueOf());
                });
            });
        }
    };
});
app.directive('showtab',function () {
    return {
        link: function (scope, element, attrs) {
            element.click(function(e) {
                e.preventDefault();
                $(element).tab('show');
            });
        }
    };
});
app.directive('excelExport',
    function () {
      return {
        restrict: 'A',
        scope: {
          fileName: "@",
            data: "&exportData"
        },
        replace: true,
        template: '<button class="btn btn-primary btn-ef btn-ef-3 btn-ef-3c mb-10" ng-click="download()"><i class="fa fa-file-excel-o"></i> Export to Excel </button>',
        link: function (scope, element) {
          
          scope.download = function() {

            function datenum(v, date1904) {
                if(date1904) v+=1462;
                var epoch = Date.parse(v);
                return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
              };
              
              function getSheet(data, opts) {
                var ws = {};
                var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
                for(var R = 0; R != data.length; ++R) {
                  for(var C = 0; C != data[R].length; ++C) {
                    if(range.s.r > R) range.s.r = R;
                    if(range.s.c > C) range.s.c = C;
                    if(range.e.r < R) range.e.r = R;
                    if(range.e.c < C) range.e.c = C;
                    var cell = {v: data[R][C] };
                    if(cell.v == null) continue;
                    var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
                    
                    if(typeof cell.v === 'number') cell.t = 'n';
                    else if(typeof cell.v === 'boolean') cell.t = 'b';
                    else if(cell.v instanceof Date) {
                      cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                      cell.v = datenum(cell.v);
                    }
                    else cell.t = 's';
                    
                    ws[cell_ref] = cell;
                  }
                }
                if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
                return ws;
              };
              
              function Workbook() {
                if(!(this instanceof Workbook)) return new Workbook();
                this.SheetNames = [];
                this.Sheets = {};
              }
               
              var wb = new Workbook(), ws = getSheet(scope.data());
              /* add worksheet to workbook */
              wb.SheetNames.push(scope.fileName);
              wb.Sheets[scope.fileName] = ws;
              var wbout = XLSX.write(wb, {bookType:'xlsx', bookSST:true, type: 'binary'});

              function s2ab(s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
                return buf;
              }
              
            saveAs(new Blob([s2ab(wbout)],{type:"application/octet-stream"}), scope.fileName+'.xlsx');
            
          };
        
        }
      };
    }
);
app.directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse',function ($filter, $document, $compile, $parse) {
  return {
    restrict: 'AE',
    scope: {
        selectedModel: '=',
        options: '=',
        extraSettings: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
    },
    template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;

        var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
        template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
        template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
        template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok green"></span>  {{texts.checkAll}}</a>';
        template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove red"></span>   {{texts.uncheckAll}}</a></li>';
        template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
        template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
        template += '<li ng-show="settings.enableSearch" class="divider"></li>';

        if (groups) {
            template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
            template += '<li ng-repeat-end role="presentation">';
        } else {
            template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
        }

        template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

        if (checkboxes) {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
            // template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
        } else {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
        }

        template += '</li>';

        template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
        template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

        template += '</ul>';
        template += '</div>';

        element.html(template);
    },
    link: function ($scope, $element, $attrs) {
        var $dropdownTrigger = $element.children()[0];

        $scope.toggleDropdown = function () {
            $scope.open = !$scope.open;
        };

        $scope.checkboxClick = function ($event, STORE) {
            $scope.setSelectedItem(STORE);
            $event.stopImmediatePropagation();
        };

        $scope.externalEvents = {
            onItemSelect: angular.noop,
            onItemDeselect: angular.noop,
            onSelectAll: angular.noop,
            onDeselectAll: angular.noop,
            onInitDone: angular.noop,
            onMaxSelectionReached: angular.noop
        };

        $scope.settings = {
            dynamicTitle: true,
            scrollable: false,
            scrollableHeight: '300px',
            closeOnBlur: true,
            displayProp: 'STORES',
            idProp: 'STORE',
            externalIdProp: 'STORE',
            enableSearch: false,
            selectionLimit: 0,
            showCheckAll: true,
            showUncheckAll: true,
            closeOnSelect: false,
            buttonClasses: 'btn btn-default',
            closeOnDeselect: false,
            groupBy: $attrs.groupBy || undefined,
            groupByTextProvider: null,
            smartButtonMaxItems: 0,
            smartButtonTextConverter: angular.noop
        };

        $scope.texts = {
            checkAll: 'Check All',
            uncheckAll: 'Uncheck All',
            selectionCount: 'checked',
            selectionOf: '/',
            searchPlaceholder: 'Search...',
            buttonDefaultText: 'Select Location',
            dynamicButtonTextSuffix: ' location select'
        };

        $scope.searchFilter = $scope.searchFilter || '';

        if (angular.isDefined($scope.settings.groupBy)) {
            $scope.$watch('options', function (newValue) {
                if (angular.isDefined(newValue)) {
                    $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                }
            });
        }

        angular.extend($scope.settings, $scope.extraSettings || []);
        angular.extend($scope.externalEvents, $scope.events || []);
        angular.extend($scope.texts, $scope.translationTexts);

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(STORE) {
            var findObj = {};

            if ($scope.settings.externalIdProp === '') {
                findObj[$scope.settings.idProp] = STORE;
            } else {
                findObj[$scope.settings.externalIdProp] = STORE;
            }

            return findObj;
        }

        function clearObject(object) {
            for (var prop in object) {
                delete object[prop];
            }
        }

        if ($scope.singleSelection) {
            if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                clearObject($scope.selectedModel);
            }
        }

        if ($scope.settings.closeOnBlur) {
            $document.on('click', function (e) {
                var target = e.target.parentElement;
                var parentFound = false;

                while (angular.isDefined(target) && target !== null && !parentFound) {
                    if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                        if (target === $dropdownTrigger) {
                            parentFound = true;
                        }
                    }
                    target = target.parentElement;
                }

                if (!parentFound) {
                    $scope.$apply(function () {
                        $scope.open = false;
                    });
                }
            });
        }

        $scope.getGroupTitle = function (groupValue) {
            if ($scope.settings.groupByTextProvider !== null) {
                return $scope.settings.groupByTextProvider(groupValue);
            }

            return groupValue;
        };

        $scope.getButtonText = function () {
            if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                if ($scope.settings.smartButtonMaxItems > 0) {
                    var itemsText = [];

                    angular.forEach($scope.options, function (optionItem) {
                        if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                            var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                            var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                            itemsText.push(converterResponse ? converterResponse : displayText);
                        }
                    });

                    if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                        itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                        itemsText.push('...');
                    }

                    return itemsText.join(', ');
                } else {
                    var totalSelected;

                    if ($scope.singleSelection) {
                        totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                    } else {
                        totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                    }

                    if (totalSelected === 0) {
                        return $scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    }
                }
            } else {
                return $scope.texts.buttonDefaultText;
            }
        };

        $scope.getPropertyForObject = function (object, property) {
            if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                return object[property];
            }

            return '';
        };

        $scope.selectAll = function () {
            $scope.deselectAll(false);
            $scope.externalEvents.onSelectAll();

            angular.forEach($scope.options, function (value) {
                $scope.setSelectedItem(value[$scope.settings.idProp], true);
            });
        };

        $scope.deselectAll = function (sendEvent) {
            sendEvent = sendEvent || true;

            if (sendEvent) {
                $scope.externalEvents.onDeselectAll();
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
            } else {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
            }
        };

        $scope.setSelectedItem = function (STORE, dontRemove) {
            var findObj = getFindObj(STORE);
            var finalObj = null;

            if ($scope.settings.externalIdProp === '') {
                finalObj = _.find($scope.options, findObj);
            } else {
                finalObj = findObj;
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
                angular.extend($scope.selectedModel, finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
                if ($scope.settings.closeOnSelect) $scope.open = false;

                return;
            }

            dontRemove = dontRemove || false;

            var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

            if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
            } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
            }
            if ($scope.settings.closeOnSelect) $scope.open = false;
        };

        $scope.isChecked = function (STORE) {
            if ($scope.singleSelection) {
                return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(STORE)[$scope.settings.idProp];
            }

            return _.findIndex($scope.selectedModel, getFindObj(STORE)) !== -1;
        };

        $scope.externalEvents.onInitDone();
    }
  };
}]);
app.directive('ngDropdownMultiselect1', ['$filter', '$document', '$compile', '$parse',function ($filter, $document, $compile, $parse) {
  return {
    restrict: 'AE',
    scope: {
        selectedModel: '=',
        options: '=',
        extraSettings: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
    },
    template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;

        var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
        template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
        template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
        template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok green"></span>  {{texts.checkAll}}</a>';
        template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove red"></span>   {{texts.uncheckAll}}</a></li>';
        template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
        template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
        template += '<li ng-show="settings.enableSearch" class="divider"></li>';

        if (groups) {
            template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
            template += '<li ng-repeat-end role="presentation">';
        } else {
            template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
        }

        template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

        if (checkboxes) {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
            // template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
        } else {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
        }

        template += '</li>';

        template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
        template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

        template += '</ul>';
        template += '</div>';

        element.html(template);
    },
    link: function ($scope, $element, $attrs) {
        var $dropdownTrigger = $element.children()[0];

        $scope.toggleDropdown = function () {
            $scope.open = !$scope.open;
        };

        $scope.checkboxClick = function ($event, GROUP_NO) {
            $scope.setSelectedItem(GROUP_NO);
            $event.stopImmediatePropagation();
        };

        $scope.externalEvents = {
            onItemSelect: angular.noop,
            onItemDeselect: angular.noop,
            onSelectAll: angular.noop,
            onDeselectAll: angular.noop,
            onInitDone: angular.noop,
            onMaxSelectionReached: angular.noop
        };

        $scope.settings = {
            dynamicTitle: true,
            scrollable: false,
            scrollableHeight: '300px',
            closeOnBlur: true,
            displayProp: 'DEPT_NAME',
            idProp: 'GROUP_NO',
            externalIdProp: 'GROUP_NO',
            enableSearch: false,
            selectionLimit: 0,
            showCheckAll: true,
            showUncheckAll: true,
            closeOnSelect: false,
            buttonClasses: 'btn btn-default',
            closeOnDeselect: false,
            groupBy: $attrs.groupBy || undefined,
            groupByTextProvider: null,
            smartButtonMaxItems: 0,
            smartButtonTextConverter: angular.noop
        };

        $scope.texts = {
            checkAll: 'Check All',
            uncheckAll: 'Uncheck All',
            selectionCount: 'checked',
            selectionOf: '/',
            searchPlaceholder: 'Search...',
            buttonDefaultText: 'Select Dept',
            dynamicButtonTextSuffix: ' dept select'
        };

        $scope.searchFilter = $scope.searchFilter || '';

        if (angular.isDefined($scope.settings.groupBy)) {
            $scope.$watch('options', function (newValue) {
                if (angular.isDefined(newValue)) {
                    $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                }
            });
        }

        angular.extend($scope.settings, $scope.extraSettings || []);
        angular.extend($scope.externalEvents, $scope.events || []);
        angular.extend($scope.texts, $scope.translationTexts);

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(GROUP_NO) {
            var findObj = {};

            if ($scope.settings.externalIdProp === '') {
                findObj[$scope.settings.idProp] = GROUP_NO;
            } else {
                findObj[$scope.settings.externalIdProp] = GROUP_NO;
            }

            return findObj;
        }

        function clearObject(object) {
            for (var prop in object) {
                delete object[prop];
            }
        }

        if ($scope.singleSelection) {
            if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                clearObject($scope.selectedModel);
            }
        }

        if ($scope.settings.closeOnBlur) {
            $document.on('click', function (e) {
                var target = e.target.parentElement;
                var parentFound = false;

                while (angular.isDefined(target) && target !== null && !parentFound) {
                    if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                        if (target === $dropdownTrigger) {
                            parentFound = true;
                        }
                    }
                    target = target.parentElement;
                }

                if (!parentFound) {
                    $scope.$apply(function () {
                        $scope.open = false;
                    });
                }
            });
        }

        $scope.getGroupTitle = function (groupValue) {
            if ($scope.settings.groupByTextProvider !== null) {
                return $scope.settings.groupByTextProvider(groupValue);
            }

            return groupValue;
        };

        $scope.getButtonText = function () {
            if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                if ($scope.settings.smartButtonMaxItems > 0) {
                    var itemsText = [];

                    angular.forEach($scope.options, function (optionItem) {
                        if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                            var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                            var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                            itemsText.push(converterResponse ? converterResponse : displayText);
                        }
                    });

                    if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                        itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                        itemsText.push('...');
                    }

                    return itemsText.join(', ');
                } else {
                    var totalSelected;

                    if ($scope.singleSelection) {
                        totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                    } else {
                        totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                    }

                    if (totalSelected === 0) {
                        return $scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    }
                }
            } else {
                return $scope.texts.buttonDefaultText;
            }
        };

        $scope.getPropertyForObject = function (object, property) {
            if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                return object[property];
            }

            return '';
        };

        $scope.selectAll = function () {
            $scope.deselectAll(false);
            $scope.externalEvents.onSelectAll();

            angular.forEach($scope.options, function (value) {
                $scope.setSelectedItem(value[$scope.settings.idProp], true);
            });
        };

        $scope.deselectAll = function (sendEvent) {
            sendEvent = sendEvent || true;

            if (sendEvent) {
                $scope.externalEvents.onDeselectAll();
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
            } else {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
            }
        };

        $scope.setSelectedItem = function (GROUP_NO, dontRemove) {
            var findObj = getFindObj(GROUP_NO);
            var finalObj = null;

            if ($scope.settings.externalIdProp === '') {
                finalObj = _.find($scope.options, findObj);
            } else {
                finalObj = findObj;
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
                angular.extend($scope.selectedModel, finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
                if ($scope.settings.closeOnSelect) $scope.open = false;

                return;
            }

            dontRemove = dontRemove || false;

            var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

            if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
            } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
            }
            if ($scope.settings.closeOnSelect) $scope.open = false;
        };

        $scope.isChecked = function (GROUP_NO) {
            if ($scope.singleSelection) {
                return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(GROUP_NO)[$scope.settings.idProp];
            }

            return _.findIndex($scope.selectedModel, getFindObj(GROUP_NO)) !== -1;
        };

        $scope.externalEvents.onInitDone();
    }
  };
}]);
app.directive('ngDropdownMultiselect2', ['$filter', '$document', '$compile', '$parse',function ($filter, $document, $compile, $parse) {
  return {
    restrict: 'AE',
    scope: {
        selectedModel: '=',
        options: '=',
        extraSettings: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
    },
    template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;

        var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
        template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
        template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
        template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok green"></span>  {{texts.checkAll}}</a>';
        template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove red"></span>   {{texts.uncheckAll}}</a></li>';
        template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
        template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
        template += '<li ng-show="settings.enableSearch" class="divider"></li>';

        if (groups) {
            template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
            template += '<li ng-repeat-end role="presentation">';
        } else {
            template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
        }

        template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

        if (checkboxes) {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
            // template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
        } else {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
        }

        template += '</li>';

        template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
        template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

        template += '</ul>';
        template += '</div>';

        element.html(template);
    },
    link: function ($scope, $element, $attrs) {
        var $dropdownTrigger = $element.children()[0];

        $scope.toggleDropdown = function () {
            $scope.open = !$scope.open;
        };

        $scope.checkboxClick = function ($event, DEPT) {
            $scope.setSelectedItem(DEPT);
            $event.stopImmediatePropagation();
        };

        $scope.externalEvents = {
            onItemSelect: angular.noop,
            onItemDeselect: angular.noop,
            onSelectAll: angular.noop,
            onDeselectAll: angular.noop,
            onInitDone: angular.noop,
            onMaxSelectionReached: angular.noop
        };

        $scope.settings = {
            dynamicTitle: true,
            scrollable: false,
            scrollableHeight: '300px',
            closeOnBlur: true,
            displayProp: 'GROUP_NAME',
            idProp: 'DEPT',
            externalIdProp: 'DEPT',
            enableSearch: false,
            selectionLimit: 0,
            showCheckAll: true,
            showUncheckAll: true,
            closeOnSelect: false,
            buttonClasses: 'btn btn-default',
            closeOnDeselect: false,
            groupBy: $attrs.groupBy || undefined,
            groupByTextProvider: null,
            smartButtonMaxItems: 0,
            smartButtonTextConverter: angular.noop
        };

        $scope.texts = {
            checkAll: 'Check All',
            uncheckAll: 'Uncheck All',
            selectionCount: 'checked',
            selectionOf: '/',
            searchPlaceholder: 'Search...',
            buttonDefaultText: 'Select Sub-Dept',
            dynamicButtonTextSuffix: ' sub-dept select'
        };

        $scope.searchFilter = $scope.searchFilter || '';

        if (angular.isDefined($scope.settings.groupBy)) {
            $scope.$watch('options', function (newValue) {
                if (angular.isDefined(newValue)) {
                    $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                }
            });
        }

        angular.extend($scope.settings, $scope.extraSettings || []);
        angular.extend($scope.externalEvents, $scope.events || []);
        angular.extend($scope.texts, $scope.translationTexts);

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(DEPT) {
            var findObj = {};

            if ($scope.settings.externalIdProp === '') {
                findObj[$scope.settings.idProp] = DEPT;
            } else {
                findObj[$scope.settings.externalIdProp] = DEPT;
            }

            return findObj;
        }

        function clearObject(object) {
            for (var prop in object) {
                delete object[prop];
            }
        }

        if ($scope.singleSelection) {
            if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                clearObject($scope.selectedModel);
            }
        }

        if ($scope.settings.closeOnBlur) {
            $document.on('click', function (e) {
                var target = e.target.parentElement;
                var parentFound = false;

                while (angular.isDefined(target) && target !== null && !parentFound) {
                    if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                        if (target === $dropdownTrigger) {
                            parentFound = true;
                        }
                    }
                    target = target.parentElement;
                }

                if (!parentFound) {
                    $scope.$apply(function () {
                        $scope.open = false;
                    });
                }
            });
        }

        $scope.getGroupTitle = function (groupValue) {
            if ($scope.settings.groupByTextProvider !== null) {
                return $scope.settings.groupByTextProvider(groupValue);
            }

            return groupValue;
        };

        $scope.getButtonText = function () {
            if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                if ($scope.settings.smartButtonMaxItems > 0) {
                    var itemsText = [];

                    angular.forEach($scope.options, function (optionItem) {
                        if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                            var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                            var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                            itemsText.push(converterResponse ? converterResponse : displayText);
                        }
                    });

                    if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                        itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                        itemsText.push('...');
                    }

                    return itemsText.join(', ');
                } else {
                    var totalSelected;

                    if ($scope.singleSelection) {
                        totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                    } else {
                        totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                    }

                    if (totalSelected === 0) {
                        return $scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    }
                }
            } else {
                return $scope.texts.buttonDefaultText;
            }
        };

        $scope.getPropertyForObject = function (object, property) {
            if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                return object[property];
            }

            return '';
        };

        $scope.selectAll = function () {
            $scope.deselectAll(false);
            $scope.externalEvents.onSelectAll();

            angular.forEach($scope.options, function (value) {
                $scope.setSelectedItem(value[$scope.settings.idProp], true);
            });
        };

        $scope.deselectAll = function (sendEvent) {
            sendEvent = sendEvent || true;

            if (sendEvent) {
                $scope.externalEvents.onDeselectAll();
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
            } else {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
            }
        };

        $scope.setSelectedItem = function (DEPT, dontRemove) {
            var findObj = getFindObj(DEPT);
            var finalObj = null;

            if ($scope.settings.externalIdProp === '') {
                finalObj = _.find($scope.options, findObj);
            } else {
                finalObj = findObj;
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
                angular.extend($scope.selectedModel, finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
                if ($scope.settings.closeOnSelect) $scope.open = false;

                return;
            }

            dontRemove = dontRemove || false;

            var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

            if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
            } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
            }
            if ($scope.settings.closeOnSelect) $scope.open = false;
        };

        $scope.isChecked = function (DEPT) {
            if ($scope.singleSelection) {
                return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(DEPT)[$scope.settings.idProp];
            }

            return _.findIndex($scope.selectedModel, getFindObj(DEPT)) !== -1;
        };

        $scope.externalEvents.onInitDone();
    }
  };
}]);
app.directive('ngDropdownMultiselect3', ['$filter', '$document', '$compile', '$parse',function ($filter, $document, $compile, $parse) {
  return {
    restrict: 'AE',
    scope: {
        selectedModel: '=',
        options: '=',
        extraSettings: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
    },
    template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;

        var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
        template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
        template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
        template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok green"></span>  {{texts.checkAll}}</a>';
        template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove red"></span>   {{texts.uncheckAll}}</a></li>';
        template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
        template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
        template += '<li ng-show="settings.enableSearch" class="divider"></li>';

        if (groups) {
            template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
            template += '<li ng-repeat-end role="presentation">';
        } else {
            template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
        }

        template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

        if (checkboxes) {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
            // template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
        } else {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
        }

        template += '</li>';

        template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
        template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

        template += '</ul>';
        template += '</div>';

        element.html(template);
    },
    link: function ($scope, $element, $attrs) {
        var $dropdownTrigger = $element.children()[0];

        $scope.toggleDropdown = function () {
            $scope.open = !$scope.open;
        };

        $scope.checkboxClick = function ($event, UDA_VALUE) {
            $scope.setSelectedItem(UDA_VALUE);
            $event.stopImmediatePropagation();
        };

        $scope.externalEvents = {
            onItemSelect: angular.noop,
            onItemDeselect: angular.noop,
            onSelectAll: angular.noop,
            onDeselectAll: angular.noop,
            onInitDone: angular.noop,
            onMaxSelectionReached: angular.noop
        };

        $scope.settings = {
            dynamicTitle: true,
            scrollable: false,
            scrollableHeight: '300px',
            closeOnBlur: true,
            displayProp: 'BRANDS',
            idProp: 'UDA_VALUE',
            externalIdProp: 'UDA_VALUE',
            enableSearch: false,
            selectionLimit: 0,
            showCheckAll: true,
            showUncheckAll: true,
            closeOnSelect: false,
            buttonClasses: 'btn btn-default',
            closeOnDeselect: false,
            groupBy: $attrs.groupBy || undefined,
            groupByTextProvider: null,
            smartButtonMaxItems: 0,
            smartButtonTextConverter: angular.noop
        };

        $scope.texts = {
            checkAll: 'Check All',
            uncheckAll: 'Uncheck All',
            selectionCount: 'checked',
            selectionOf: '/',
            searchPlaceholder: 'Search...',
            buttonDefaultText: 'Select Multiple Brand',
            dynamicButtonTextSuffix: ' brand select'
        };

        $scope.searchFilter = $scope.searchFilter || '';

        if (angular.isDefined($scope.settings.groupBy)) {
            $scope.$watch('options', function (newValue) {
                if (angular.isDefined(newValue)) {
                    $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                }
            });
        }

        angular.extend($scope.settings, $scope.extraSettings || []);
        angular.extend($scope.externalEvents, $scope.events || []);
        angular.extend($scope.texts, $scope.translationTexts);

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(UDA_VALUE) {
            var findObj = {};

            if ($scope.settings.externalIdProp === '') {
                findObj[$scope.settings.idProp] = UDA_VALUE;
            } else {
                findObj[$scope.settings.externalIdProp] = UDA_VALUE;
            }

            return findObj;
        }

        function clearObject(object) {
            for (var prop in object) {
                delete object[prop];
            }
        }

        if ($scope.singleSelection) {
            if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                clearObject($scope.selectedModel);
            }
        }

        if ($scope.settings.closeOnBlur) {
            $document.on('click', function (e) {
                var target = e.target.parentElement;
                var parentFound = false;

                while (angular.isDefined(target) && target !== null && !parentFound) {
                    if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                        if (target === $dropdownTrigger) {
                            parentFound = true;
                        }
                    }
                    target = target.parentElement;
                }

                if (!parentFound) {
                    $scope.$apply(function () {
                        $scope.open = false;
                    });
                }
            });
        }

        $scope.getGroupTitle = function (groupValue) {
            if ($scope.settings.groupByTextProvider !== null) {
                return $scope.settings.groupByTextProvider(groupValue);
            }

            return groupValue;
        };

        $scope.getButtonText = function () {
            if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                if ($scope.settings.smartButtonMaxItems > 0) {
                    var itemsText = [];

                    angular.forEach($scope.options, function (optionItem) {
                        if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                            var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                            var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                            itemsText.push(converterResponse ? converterResponse : displayText);
                        }
                    });

                    if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                        itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                        itemsText.push('...');
                    }

                    return itemsText.join(', ');
                } else {
                    var totalSelected;

                    if ($scope.singleSelection) {
                        totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                    } else {
                        totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                    }

                    if (totalSelected === 0) {
                        return $scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    }
                }
            } else {
                return $scope.texts.buttonDefaultText;
            }
        };

        $scope.getPropertyForObject = function (object, property) {
            if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                return object[property];
            }

            return '';
        };

        $scope.selectAll = function () {
            $scope.deselectAll(false);
            $scope.externalEvents.onSelectAll();

            angular.forEach($scope.options, function (value) {
                $scope.setSelectedItem(value[$scope.settings.idProp], true);
            });
        };

        $scope.deselectAll = function (sendEvent) {
            sendEvent = sendEvent || true;

            if (sendEvent) {
                $scope.externalEvents.onDeselectAll();
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
            } else {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
            }
        };

        $scope.setSelectedItem = function (UDA_VALUE, dontRemove) {
            var findObj = getFindObj(UDA_VALUE);
            var finalObj = null;

            if ($scope.settings.externalIdProp === '') {
                finalObj = _.find($scope.options, findObj);
            } else {
                finalObj = findObj;
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
                angular.extend($scope.selectedModel, finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
                if ($scope.settings.closeOnSelect) $scope.open = false;

                return;
            }

            dontRemove = dontRemove || false;

            var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

            if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
            } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
            }
            if ($scope.settings.closeOnSelect) $scope.open = false;
        };

        $scope.isChecked = function (UDA_VALUE) {
            if ($scope.singleSelection) {
                return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(UDA_VALUE)[$scope.settings.idProp];
            }

            return _.findIndex($scope.selectedModel, getFindObj(UDA_VALUE)) !== -1;
        };

        $scope.externalEvents.onInitDone();
    }
  };
}]);

app.directive('ngDropdownMultiselect4', ['$filter', '$document', '$compile', '$parse',function ($filter, $document, $compile, $parse) {
  return {
    restrict: 'AE',
    scope: {
        selectedModel: '=',
        options: '=',
        extraSettings: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
    },
    template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;

        var template = '<div class="multiselect-parent btn-group dropdown-multiselect">';
        template += '<button type="button" class="dropdown-toggle" ng-class="settings.buttonClasses" ng-click="toggleDropdown()">{{getButtonText()}}&nbsp;<span class="caret"></span></button>';
        template += '<ul class="dropdown-menu dropdown-menu-form" ng-style="{display: open ? \'block\' : \'none\', height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" style="overflow: scroll" >';
        template += '<li ng-hide="!settings.showCheckAll || settings.selectionLimit > 0"><a data-ng-click="selectAll()"><span class="glyphicon glyphicon-ok green"></span>  {{texts.checkAll}}</a>';
        template += '<li ng-show="settings.showUncheckAll"><a data-ng-click="deselectAll();"><span class="glyphicon glyphicon-remove red"></span>   {{texts.uncheckAll}}</a></li>';
        template += '<li ng-hide="(!settings.showCheckAll || settings.selectionLimit > 0) && !settings.showUncheckAll" class="divider"></li>';
        template += '<li ng-show="settings.enableSearch"><div class="dropdown-header"><input type="text" class="form-control" style="width: 100%;" ng-model="searchFilter" placeholder="{{texts.searchPlaceholder}}" /></li>';
        template += '<li ng-show="settings.enableSearch" class="divider"></li>';

        if (groups) {
            template += '<li ng-repeat-start="option in orderedItems | filter: searchFilter" ng-show="getPropertyForObject(option, settings.groupBy) !== getPropertyForObject(orderedItems[$index - 1], settings.groupBy)" role="presentation" class="dropdown-header">{{ getGroupTitle(getPropertyForObject(option, settings.groupBy)) }}</li>';
            template += '<li ng-repeat-end role="presentation">';
        } else {
            template += '<li role="presentation" ng-repeat="option in options | filter: searchFilter">';
        }

        template += '<a role="menuitem" tabindex="-1" ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp))">';

        if (checkboxes) {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
            // template += '<div class="checkbox"><label><input class="checkboxInput" type="checkbox" ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" /> {{getPropertyForObject(option, settings.displayProp)}}</label></div></a>';
        } else {
            template += '<span data-ng-class="{\'glyphicon glyphicon-ok green\': isChecked(getPropertyForObject(option,settings.idProp))}"></span> {{getPropertyForObject(option, settings.displayProp)}}</a>';
        }

        template += '</li>';

        template += '<li class="divider" ng-show="settings.selectionLimit > 1"></li>';
        template += '<li role="presentation" ng-show="settings.selectionLimit > 1"><a role="menuitem">{{selectedModel.length}} {{texts.selectionOf}} {{settings.selectionLimit}} {{texts.selectionCount}}</a></li>';

        template += '</ul>';
        template += '</div>';

        element.html(template);
    },
    link: function ($scope, $element, $attrs) {
        var $dropdownTrigger = $element.children()[0];

        $scope.toggleDropdown = function () {
            $scope.open = !$scope.open;
        };

        $scope.checkboxClick = function ($event, UDA_VALUE) {
            $scope.setSelectedItem(UDA_VALUE);
            $event.stopImmediatePropagation();
        };

        $scope.externalEvents = {
            onItemSelect: angular.noop,
            onItemDeselect: angular.noop,
            onSelectAll: angular.noop,
            onDeselectAll: angular.noop,
            onInitDone: angular.noop,
            onMaxSelectionReached: angular.noop
        };

        $scope.settings = {
            dynamicTitle: true,
            scrollable: false,
            scrollableHeight: '300px',
            closeOnBlur: true,
            displayProp: 'BRANDS',
            idProp: 'UDA_VALUE',
            externalIdProp: 'UDA_VALUE',
            enableSearch: false,
            selectionLimit: 0,
            showCheckAll: true,
            showUncheckAll: true,
            closeOnSelect: false,
            buttonClasses: 'btn btn-default',
            closeOnDeselect: false,
            groupBy: $attrs.groupBy || undefined,
            groupByTextProvider: null,
            smartButtonMaxItems: 0,
            smartButtonTextConverter: angular.noop
        };

        $scope.texts = {
            checkAll: 'Check All',
            uncheckAll: 'Uncheck All',
            selectionCount: 'checked',
            selectionOf: '/',
            searchPlaceholder: 'Search...',
            buttonDefaultText: 'Select Multiple Brand',
            dynamicButtonTextSuffix: ' brand select'
        };

        $scope.searchFilter = $scope.searchFilter || '';

        if (angular.isDefined($scope.settings.groupBy)) {
            $scope.$watch('options', function (newValue) {
                if (angular.isDefined(newValue)) {
                    $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
                }
            });
        }

        angular.extend($scope.settings, $scope.extraSettings || []);
        angular.extend($scope.externalEvents, $scope.events || []);
        angular.extend($scope.texts, $scope.translationTexts);

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(UDA_VALUE) {
            var findObj = {};

            if ($scope.settings.externalIdProp === '') {
                findObj[$scope.settings.idProp] = UDA_VALUE;
            } else {
                findObj[$scope.settings.externalIdProp] = UDA_VALUE;
            }

            return findObj;
        }

        function clearObject(object) {
            for (var prop in object) {
                delete object[prop];
            }
        }

        if ($scope.singleSelection) {
            if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
                clearObject($scope.selectedModel);
            }
        }

        if ($scope.settings.closeOnBlur) {
            $document.on('click', function (e) {
                var target = e.target.parentElement;
                var parentFound = false;

                while (angular.isDefined(target) && target !== null && !parentFound) {
                    if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                        if (target === $dropdownTrigger) {
                            parentFound = true;
                        }
                    }
                    target = target.parentElement;
                }

                if (!parentFound) {
                    $scope.$apply(function () {
                        $scope.open = false;
                    });
                }
            });
        }

        $scope.getGroupTitle = function (groupValue) {
            if ($scope.settings.groupByTextProvider !== null) {
                return $scope.settings.groupByTextProvider(groupValue);
            }

            return groupValue;
        };

        $scope.getButtonText = function () {
            if ($scope.settings.dynamicTitle && ($scope.selectedModel.length > 0 || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
                if ($scope.settings.smartButtonMaxItems > 0) {
                    var itemsText = [];

                    angular.forEach($scope.options, function (optionItem) {
                        if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                            var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                            var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);

                            itemsText.push(converterResponse ? converterResponse : displayText);
                        }
                    });

                    if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                        itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                        itemsText.push('...');
                    }

                    return itemsText.join(', ');
                } else {
                    var totalSelected;

                    if ($scope.singleSelection) {
                        totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
                    } else {
                        totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
                    }

                    if (totalSelected === 0) {
                        return $scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
                    }
                }
            } else {
                return $scope.texts.buttonDefaultText;
            }
        };

        $scope.getPropertyForObject = function (object, property) {
            if (angular.isDefined(object) && object.hasOwnProperty(property)) {
                return object[property];
            }

            return '';
        };

        $scope.selectAll = function () {
            $scope.deselectAll(false);
            $scope.externalEvents.onSelectAll();

            angular.forEach($scope.options, function (value) {
                $scope.setSelectedItem(value[$scope.settings.idProp], true);
            });
        };

        $scope.deselectAll = function (sendEvent) {
            sendEvent = sendEvent || true;

            if (sendEvent) {
                $scope.externalEvents.onDeselectAll();
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
            } else {
                $scope.selectedModel.splice(0, $scope.selectedModel.length);
            }
        };

        $scope.setSelectedItem = function (UDA_VALUE, dontRemove) {
            var findObj = getFindObj(UDA_VALUE);
            var finalObj = null;

            if ($scope.settings.externalIdProp === '') {
                finalObj = _.find($scope.options, findObj);
            } else {
                finalObj = findObj;
            }

            if ($scope.singleSelection) {
                clearObject($scope.selectedModel);
                angular.extend($scope.selectedModel, finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
                if ($scope.settings.closeOnSelect) $scope.open = false;

                return;
            }

            dontRemove = dontRemove || false;

            var exists = _.findIndex($scope.selectedModel, findObj) !== -1;

            if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
            } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
            }
            if ($scope.settings.closeOnSelect) $scope.open = false;
        };

        $scope.isChecked = function (UDA_VALUE) {
            if ($scope.singleSelection) {
                return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(UDA_VALUE)[$scope.settings.idProp];
            }

            return _.findIndex($scope.selectedModel, getFindObj(UDA_VALUE)) !== -1;
        };

        $scope.externalEvents.onInitDone();
    }
  };
}]);

    
