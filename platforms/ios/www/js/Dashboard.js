/**
 * @fileOverview
 * Dashboard module<br>
 * @author Shmidt Ivan
 * @version 0.0.1
 * @module Dashboard
 * @requires DashboardConfig
 * @requires Widget
 * @requires Filter
 * @requires MessageCenter
 * @requires jQuery
 * @todo Delete jQuery dependency
 */
define([
    'DashboardConfig',
    'Widget',
    'Filter',
    'MessageCenter',
    "WidgetMap"
], function (DashboardConfiguration, Widget, Filter, mc, WidgetMap) {
    'use strict';
    /**
     * @class
     * @class Dashboard
     * @alias module:Dashboard
     * @listens module:MessageCenter#filters_acquired
     * @fires module:MessageCenter#filters_requested
     * @return {Dashboard} New dashboard object
     */
    function Dashboard(dashName) {
        /**@lends module:Dashboard#*/
        var self = this;
        /**
         * Array of Widget objects
         * @var {Array<module:Widget>}
         * @name module:Dashboard#widgets
         * @todo Make this one private
         */
        this.widgets = [];
        /** 
         * Flag, that shows current active widget
         * @var {number} module:Dashboard#activeWidget
         * @public
         */
        this.activeWidget = undefined;
        /**
         * Array of Filter objects
         * @var {Array<module:Filter>}
         * @name module:Dashboard#filters
         * @todo Make this one private
         */
        this.filters = [];
        this.onDashboardDataAcquired = function (d) {
            var widgets = d.children;
            _.each(widgets, function (widget) {
                var widget_config = WidgetMap[widget.type];
                if(!widget_config) {self.addWidget({title:"Not implemented"}).render(); return;}
                widget_config.datasource = {
                    data: {
                        MDX: widget.mdx
                    }
                };
                widget_config.filters = [];
                _.each(widget.children, function (filter) {
                    widget_config.filters.push({
                        name: filter.label,
                        path: filter.path,
                        value: filter.value
                    });
                });

                widget_config.chartConfig.title = {
                    text: widget.title
                };
                self.addWidget(widget_config).render();
            });
        };
        mc.subscribe("data_acquired:dashboard", {
            subscriber: this,
            callback: this.onDashboardDataAcquired
        });
        mc.publish("data_requested:dashboard", dashName);
        /**
         * Dashboard config
         * @var {module:DashboardConfig} module:Dashboard#config
         */
        this.config = new DashboardConfiguration();
        /**
         * Renders up the whole dashboard with its widgets and so on.
         * @function module:Dashboard#render
         */
        this.render = function () {
            var holder = (this.config && this.config.holder) ? this.config.holder : "body";
            require(['text!../views/Dashboard.html'], function (html) {
                $(holder + " > *").remove();
                $(holder).append(html);
            });
            for (var i = 0; i < this.widgets.length; i++) {
                this.widgets[i].render()
            }
            var self = this;
            //Handling active widget change
            $(this.config.holder).on("slide", function (e) {
                if (self.activeWidget != e.originalEvent.detail.slideNumber) {
                    self.activeWidget = e.originalEvent.detail.slideNumber;
                    if (mc) mc.publish("set_active_widget", {
                        id: self.activeWidget
                    });
                }
            });

            return this;
        };
        /**
         * Renders up the whole dashboard with its widgets and so on.
         * @function module:Dashboard#addWidget
         * @param config {Object}  Configuration object for Widget
         * @example
         *  a.addWidget({
        title: "Очередь пациентов по профилям",
        amconfig: {
            "type": "serial",
            "pathToImages": "http://cdn.amcharts.com/lib/3/images/",
            "categoryField": "category",
            "rotate": true,
            "startDuration": 1,
            "categoryAxis": {
                "autoRotateCount": -5,
                "gridPosition": "start",
                "inside": true
            },
            "trendLines": [],
            "graphs": [
                {
                    "balloonText": "[[title]] of [[category]]:[[value]]",
                    "fillAlphas": 1,
                    "id": "AmGraph-1",
                    "title": "",
                    "type": "column",
                    "valueField": "value"
      }
     ],
            "guides": [],
            "valueAxes": [
                {
                    "axisTitleOffset": -7,
                    "id": "ValueAxis-1",
                    "title": "Кол-во человек"
      }
     ],
            "allLabels": [],
            "balloon": {},
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": ""
      }
     ],

        },
        datasource: {
            data: {
                MDX: 'SELECT NON EMPTY {TOPPERCENT(ORDER([ProfileMODep].[H1].[Profile].Members,Measures.[%COUNT],BDESC),80),%LABEL(SUM(BOTTOMPERCENT(ORDER([ProfileMODep].[H1].[Profile].Members,Measures.[%COUNT],BDESC),20)),"Другой",,,,"font-style:italic;")} ON 1 FROM [QueueCube]'
            }
        },
        filters: [{
            name: "status",
            path: "[status].[H1].[status]",
            value: "&[0]",
            valueName: "0"
        }]
    });
         */
        this.addWidget = function (config) {
            var config = config || {};
            config.dashboard = this;
            config.id = this.widgets.length;
            var widget = new Widget(config);
            this.widgets[this.widgets.length] = widget;
            if (this.activeWidget == null) {
                this.activeWidget = 0;
            }
            return this;
        }
        mc.subscribe("filters_acquired", {
            subscriber: this,
            callback: function (d) {
                for (var i = 0; i < d.data.data.length; i++) {
                    this.filters.push(new Filter(d.data.data[i]));
                }
            }
        });
        mc.publish("filters_requested");


    };
    /**
     * @name module:Dashboard#toString
     * @function
     * @return {String} Module name
     */
    Dashboard.prototype.toString = function () {
        return "Dashboard";
    };
    return Dashboard;


})