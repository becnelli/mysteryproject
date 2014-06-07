Ext.define('MyApp.App', {
    requires: ['MyApp.Toggle', 'MyApp.BoardErrorMessage'],
    extend: 'Rally.app.App',
    componentCls: 'app',
    statics: {
        BUSINESS_VALUE_PROPERTY: 'c_BusinessValue'
    },
    items: [
    ],
    padding: '20 20 20 20',
    launch: function () {
        this._addHeader();
        this._addToggle();
        this.attributeName = 'PlanEstimate';
        this._addBoard();
    },
    _addToggle: function () {
        var container = this.add({
            xtype: 'container',
            layout: {type: 'hbox', pack: 'end'},
            items: [
                {
                    xtype: 'customtoggle',
                    businessValueProperty: MyApp.App.BUSINESS_VALUE_PROPERTY,
                    listeners: {
                        toggle: {fn: this._boardToggled, scope: this}
                    },
                    margin: '0 0 10 0'
                }
            ]
        });
    },
    _boardToggled: function (sender, attribute) {
        this.remove(this.board);
        this.remove(this.grid);
        this.remove(this.message);
        this.attributeName = attribute;
        
        if(this.attributeName != 'Ranking') {
            this._addBoard();
        }
        else {
            this._addRankingGrid();
        }
    },

    _addHeader: function () {
        this.header = this.add({xtype: 'component', tpl: '<div class="headerContainer"><tpl if="img"><img src={img} width="40" height="40"/></tpl><h1>{text}</h1></div>', data: {text: 'HEADER'}, margin: '10 0 10 0'});
    },
    
    _addRankingGrid: function() {
        this.header.update({img: 'img/bang.jpg', text: 'Story Value per Cost'});

        Ext.create('Rally.data.wsapi.Store', {
            model: 'userstory',
            autoLoad: true,
            listeners: {
                load: this._onGridDataLoaded,
                scope: this
            },
            filters: [
                {
                    property: 'PlanEstimate',
                    operator: '!=',
                    value: null
                },
                {
                    property: MyApp.App.BUSINESS_VALUE_PROPERTY,
                    operator: '!=',
                    value: null
                },
                {
                    property: 'DirectChildrenCount',
                    operator: '=',
                    value: '0'
                }
            ],
            fetch: ['FormattedID', 'Name', 'PlanEstimate', MyApp.App.BUSINESS_VALUE_PROPERTY]
        });
    },

    _onGridDataLoaded: function (store, data) {
        if(!this._supportsBusinessValue(data)){
            this.message = this.add({
                xtype:'boarderrormessage',
                businessValueProperty: MyApp.App.BUSINESS_VALUE_PROPERTY
            });
            return;
        }

        var records = _.map(data, function (record) {
            return Ext.apply({
                Bang: (record.get(MyApp.App.BUSINESS_VALUE_PROPERTY) / record.get('PlanEstimate')).toFixed(2)
            }, record.getData());
        });

        this.grid = this.add({
            xtype: 'rallygrid',
            showPagingToolbar: false,
            showRowActionsColumn: false,
            editable: false,
            store: Ext.create('Rally.data.custom.Store', {
                data: records,
                sorters: [
                    {property: 'Bang', direction: 'DESC'}
                ]
            }),
            columnCfgs: [
                {
                    xtype: 'templatecolumn',
                    text: 'ID',
                    dataIndex: 'FormattedID',
                    width: 100,
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Bang',
                    dataIndex: 'Bang'
                },
                {
                    text: 'Name',
                    dataIndex: 'Name',
                    flex: 1
                },
                {
                    text: 'Business Value',
                    dataIndex: MyApp.App.BUSINESS_VALUE_PROPERTY
                },
                {
                    text: 'Plan Estimate',
                    dataIndex: 'PlanEstimate'
                }
            ]
        });
    },
    
    _addBoard: function () {
        var text = this.attributeName === 'PlanEstimate' ? "Plan Estimate for Stories" : "Business Value for Stories";
        this.header.update({text: text});
        
        Ext.create('Rally.data.wsapi.Store', {
            model: 'userstory',
            autoLoad: true,
            listeners: {
                load: this._onBoardDataLoaded,
                scope: this
            },
            filters: [
                {
                    property: 'Iteration',
                    operator: '=',
                    value: ''
                },
                {
                    property: 'DirectChildrenCount',
                    operator: '=',
                    value: '0'
                }
            ],
            fetch: ['FormattedID', 'Name', 'PlanEstimate', MyApp.App.BUSINESS_VALUE_PROPERTY]
        });
    },
    
    _onBoardDataLoaded: function(store, data) { 
        var definedColumns = [0, 1, 2, 3, 5, 8, 13, 20];
        
        var valueAttributes = _.map(data, function(record) { return record.get(this.attributeName); }, this);
        
        var uniqueValues = _.uniq(valueAttributes);
        
        var uniqueValuesNoNull = _.filter(uniqueValues, function(value) { return value != null; });
        
        var unorderedColumns = _.union(definedColumns, uniqueValuesNoNull);
        
        var estimateValues = _.sortBy(unorderedColumns, function(num) { return num; });

        var columns = [
            {
                value: null,
                columnHeaderConfig: {
                    headerData: {value: 'Unestimated'}
                }
            }
        ];

        _.each(estimateValues, function (estimate) {
            var borderValue = 0;
            if(!_.contains(definedColumns, estimate)){
                borderValue = 1;
            }
            
            columns.push({
                value: estimate,
                columnHeaderConfig: {
                    headerData: {value: estimate}
                }, 
                border: borderValue,
                style: {
                    borderColor: 'red',
                    borderStyle: 'solid'
                }
            });
        });

        if(!this._supportsBusinessValue(data) && this.attributeName === MyApp.App.BUSINESS_VALUE_PROPERTY){
            this.message = this.add({
                xtype:'boarderrormessage',
                businessValueProperty: MyApp.App.BUSINESS_VALUE_PROPERTY
            });
        }
        else {
             this.board = this.add({
            xtype: 'rallycardboard',
            types: ['User Story'],
            attribute: this.attributeName,
            context: this.getContext(),
            margin: '10 0 0 0',
            columnConfig: {
                columnHeaderConfig: {
                    headerTpl: '{value}'
                }
            },
            storeConfig: {
                filters: [
                    {
                        property: 'Iteration',
                        operator: '=',
                        value: ''
                    },
                    {
                        property: 'DirectChildrenCount',
                        operator: '=',
                        value: '0'
                    }
                ]
            },
            columns: columns
        });

        }
    },
    _supportsBusinessValue: function(data){
        if(_.isUndefined(this.valueUnsupported)){
            return this.valueUnsupported;
        }
        else{
            this.valueUnsupported = data.length > 0 && _.has(data[0].data, MyApp.App.BUSINESS_VALUE_PROPERTY);
            return this.valueUnsupported;
        }
    }
});
