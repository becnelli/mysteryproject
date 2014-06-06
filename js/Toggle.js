(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('MyApp.Toggle', {
        requires:['Rally.ui.Button'],
        extend:'Ext.Container',
        alias:'widget.customtoggle',

        componentCls: '',
        layout: 'hbox',
        border: 1,
        activeButtonCls: 'active hide-tooltip',

        toggleState: 'PlanEstimate',

        defaultType: 'rallybutton',
        items: [
            {
                cls: 'toggle left',
                itemId: 'PlanEstimate',
                text: 'Plan Estimate',
                frame: false,
                toolTipConfig: {
                    html: 'Switch to Plan Estimates',
                    anchor: 'bottom',
                    hideDelay: 0
                },
                width: 200
            },
            {
                cls: 'toggle center',
                itemId: 'BusinessValue',
                text: 'Business Value',
                frame: false,
                toolTipConfig: {
                    html: 'Switch to Business Value',
                    anchor: 'bottom',
                    hideDelay: 0
                },
                width: 200
            },
            {
                cls: 'toggle right',
                itemId: 'Ranking',
                text: 'Ranking',
                frame: false,
                toolTipConfig: {
                    html: 'Show Ranking',
                    anchor: 'bottom',
                    hideDelay: 0
                },
                width: 200
            }
        ],

        initComponent: function() {
            this.callParent(arguments);

            this.addEvents([
                /**
                 * @event toggle
                 * Fires when the toggle value is changed.
                 * @param {String} toggleState 'BusinessValue' or 'PlanEstimate'.
                 */
                'toggle'
            ]);

            this.items.each(function(item) {
                this.mon(item, 'click', this._onButtonClick, this);
            }, this);

            this.down('#' + this.toggleState).addCls(this.activeButtonCls);
        },

        _onButtonClick: function(btn) {
            var btnId = btn.getItemId();
            if (btnId !== this.toggleState) {
                this.toggleState = btnId;

                this.items.each(function(item) {
                    if (item === btn) {
                        if (!item.hasCls(this.activeButtonCls.split(' ')[0])) {
                            item.addCls(this.activeButtonCls);
                        }
                    } else {
                        item.removeCls(this.activeButtonCls);
                    }
                }, this);

                this.fireEvent('toggle', this, this.toggleState);
            }
        }
    });
})();

