Ext.define('MyApp.App', {
    requires: ['MyApp.Toggle'],
    extend: 'Rally.app.App',
    componentCls: 'app',
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
        var container = this.add({xtype: 'container',
            layout: {type: 'hbox', pack: 'end'},
            items: [
                {
                    xtype: 'customtoggle',
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
                    property: 'c_BusinessValue',
                    operator: '!=',
                    value: null
                },
                {
                    property: 'DirectChildrenCount',
                    operator: '=',
                    value: '0'
                }
            ],
            fetch: ['FormattedID', 'Name', 'PlanEstimate', 'c_BusinessValue']
        });
    },

    _onGridDataLoaded: function (store, data) {
        var records = _.map(data, function (record) {
            return Ext.apply({
                Bang: (record.get('c_BusinessValue') / record.get('PlanEstimate')).toFixed(2)
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
                    dataIndex: 'c_BusinessValue'
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
            fetch: ['FormattedID', 'Name', 'PlanEstimate', 'c_BusinessValue']
        });
    },
        
    _onBoardDataLoaded: function(store, data) { 
        var valueAttributes = _.map(data, function(record) { return record.get(this.attributeName); }, this);
        var uniqueValues = _.uniq(valueAttributes);
        var uniqueValuesNoNull = _.filter(uniqueValues, function(value) { return value != null; });
        
        var unorderedColumns = _.union([0, 1, 2, 3, 5, 8, 13, 20], uniqueValuesNoNull);
        
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
            columns.push({
                value: estimate,
                columnHeaderConfig: {
                    headerData: {value: estimate}
                }
            });
        });

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
});
