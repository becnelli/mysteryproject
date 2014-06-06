Ext.define('MyApp.App', {
    requires: ['MyApp.Toggle'],
    extend: 'Rally.app.App',
    componentCls: 'app',
    padding: '20 20 20 20',
    items: [
    ],
    padding: '20 20 20 20',
    
    launch: function() {
        this._addToggle();
        this._addHeader();
        this._addBoard('PlanEstimate');
    },
    
    _addToggle: function(){
        this.add({
            xtype: 'customtoggle',
            listeners: {
                toggle: {fn: this._boardToggled, scope: this}
            }
        });
    },
    
    _boardToggled: function(sender, attribute){
        this.remove(this.board);
        this.remove(this.grid);
        
        if(attribute != 'Ranking') {
            this._addBoard(attribute);
        }
        else {
            this._addRankingGrid();
        }
    },
    
    _addHeader: function(){
        this.header = this.add({xtype: 'component', tpl: '<h1>{text}</h1>', data: {text: 'HEADER'}, margin: '10 0 10 0'});
    },
    
    _addRankingGrid: function() {
        this.header.update({text: 'Story Value per Cost <img src="img/bang.jpg" height="40"/>'});
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
    
    _onGridDataLoaded: function(store, data) {
        var records = _.map(data, function(record) {
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
                sorters: [{property: 'Bang', direction: 'DESC'}]
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
    
    
    _addBoard: function(attribute) {
        var text = attribute === 'PlanEstimate' ? "Plan Estimate for Stories" : "Business Value for Stores";
        this.header.update({text: text});
        var columns = [
            {
                value: null,
                columnHeaderConfig: {
                    headerData: {value: 'Unestimated'}
                }
            }
        ];
        
        var estimateValues = [0, 1, 2, 3, 5, 8, 13, 20];

        _.each(estimateValues, function(estimate) {
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
            attribute: attribute,
            context: this.getContext(),
            margin: '10 0 0 0',
            listeners: {
              load: function(){Ext.resumeLayouts(true);}  
            },
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