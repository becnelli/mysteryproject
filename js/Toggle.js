(function () {
    var Ext = window.Ext4 || window.Ext;

    Ext.define('MyApp.Toggle', {
        requires:['Rally.ui.Button'],
        extend:'Ext.Container',
        alias:'widget.customtoggle',

        componentCls: 'rui-gridboard-toggle toggle-button-group',
        layout: 'hbox',
        border: 1,
        activeButtonCls: 'active hide-tooltip',

        toggleState: 'grid',

        defaultType: 'rallybutton',
        items: [
            {
                itemId: 'board',
                cls: 'toggle board left',
                iconCls: 'icon-board',
                frame: false,
                toolTipConfig: {
                    html: 'Switch to Plan Estimates',
                    anchor: 'bottom',
                    hideDelay: 0
                }
            },
            {
                itemId: 'grid',
                cls: 'toggle grid right',
                iconCls: 'icon-grid',
                frame: false,
                toolTipConfig: {
                    html: 'Switch to Business Value',
                    anchor: 'bottom',
                    hideDelay: 0
                }
            }
        ],

        initComponent: function() {
            this.callParent(arguments);

            this.addEvents([
                /**
                 * @event toggle
                 * Fires when the toggle value is changed.
                 * @param {String} toggleState 'grid' or 'board'.
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

