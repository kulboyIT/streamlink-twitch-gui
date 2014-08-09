define( [ "ember" ], function( Ember ) {

	var nwGui, nwWindow, maximized;
	if ( window.process && window.process.env ) {
		nwGui = window.nwDispatcher.requireNwGui();
		nwWindow = nwGui.Window.get();
		nwWindow.on( "maximize",   function() { maximized = true;  } );
		nwWindow.on( "unmaximize", function() { maximized = false; } );
	}


	return Ember.Controller.extend({
		needs: [ "livestreamer", "modal" ],

		dev: DEBUG,

		nwGui: nwGui,
		nwWindow: nwWindow,

		// use an alias here: a binding will reach the callstack limit
		streamsLength: Ember.computed.alias( "controllers.livestreamer.streams.length" ),

		actions: {
			"winRefresh": function() {
				nwWindow && nwWindow.reloadIgnoringCache();
			},

			"winDevTools": function() {
				nwWindow && nwWindow.showDevTools()
			},

			"winMin": function() {
				nwWindow && nwWindow.minimize();
			},

			"winMax": function() {
				nwWindow && nwWindow[ maximized ? "unmaximize" : "maximize" ]();
			},

			"winClose": function() {
				var	modal	= this.get( "controllers.modal" ),
					quit	= function() { nwWindow && nwWindow.close(); },
					stop	= function() {
						this.get( "controllers.livestreamer" ).killAll();
						quit();
					}.bind( this );

				if ( this.get( "streamsLength" ) ) {
					this.send( "openModal",
						"Are you sure you want to quit?",
						"You're still watching streams.",
						[
							new modal.Button( "Return", "", "fa fa-thumbs-down" ),
							new modal.Button( "Shutdown", "btn-danger", "fa fa-power-off", stop ),
							new modal.Button( "Quit", "btn-success", "fa fa-thumbs-up", quit )
						]
					);
				} else {
					quit();
				}
			}
		}
	});

});
