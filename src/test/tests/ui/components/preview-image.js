import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { buildResolver } from "test-utils";
import { render } from "@ember/test-helpers";
import hbs from "htmlbars-inline-precompile";
import transparentImage from "transparent-image";

import { scheduleOnce } from "@ember/runloop";

import PreviewImageComponent from "ui/components/preview-image/component";


module( "ui/components/preview-image", function( hooks ) {
	setupRenderingTest( hooks, {
		resolver: buildResolver({
			PreviewImageComponent
		})
	});


	test( "Valid image source", async function( assert ) {
		await new Promise( ( resolve, reject ) => {
			this.setProperties({
				src: transparentImage,
				title: "bar",
				onLoad: resolve,
				onError: reject
			});
			render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` )
				.catch( reject );
		});

		assert.ok(
			this.element.querySelector( ".previewImage" ) instanceof HTMLImageElement,
			"Image loads correctly"
		);
		assert.strictEqual(
			this.element.querySelector( "img" ).getAttribute( "src" ),
			transparentImage,
			"Has the correct image source"
		);
		assert.strictEqual(
			this.element.querySelector( "img" ).getAttribute( "title" ),
			"bar",
			"Has the correct element title"
		);
	});

	test( "Invalid image source", async function( assert ) {
		await new Promise( ( resolve, reject ) => {
			this.setProperties({
				// using the page's URL as image src will cause the onerror event to be triggered
				src: document.location.href,
				title: "bar",
				onLoad: reject,
				onError: resolve
			});
			render( hbs`{{preview-image src=src title=title onLoad=onLoad onError=onError}}` )
				.catch( reject );
		});

		assert.notOk(
			this.element.querySelector( ".previewImage" ) instanceof HTMLImageElement,
			"Doesn't have a preview image"
		);
		assert.ok(
			this.element.querySelector( ".previewError" ),
			"Is in error state"
		);
		assert.strictEqual(
			this.element.querySelector( ".previewError" ).getAttribute( "title" ),
			"bar",
			"Error element has a title"
		);
	});

	test( "Missing image source", async function( assert ) {
		await render( hbs`{{preview-image}}` );

		assert.notOk(
			this.element.querySelector( "img" ),
			"Does not have an image element"
		);

		await new Promise( resolve => scheduleOnce( "afterRender", resolve ) );

		assert.ok(
			this.element.querySelector( ".previewError" ),
			"Is in error state"
		);
	});

	test( "Updating image source", async function( assert ) {
		this.set( "src", transparentImage );
		await render( hbs`{{preview-image src=src}}` );

		const img = this.element.querySelector( "img" );
		assert.ok( img, "Does have an image element" );
		assert.strictEqual( img.src, transparentImage, "Image has the correct source" );

		this.set( "src", "" );
		await new Promise( resolve => scheduleOnce( "afterRender", resolve ) );
		assert.strictEqual( img.src, transparentImage, "Image source is unbound" );
	});
});
