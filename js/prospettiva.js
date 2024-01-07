/* )c( 2019 kalamun.net */

// all videos should be recorded at 60 bpm
var playlist = [
	
		'00-teatrosatanico.mp4',
		// 'intro.mp4',
		
		// dagdadiel
		'dag_01a.mp4',
		'dag_01b.mp4',
		'dag_01c.mp4',
		
		// parfaxitas
		'par_elchamuco.mp4',
		
		// uriens
		'uri_lava.mp4',
		//'uri_flames.mp4',
		'uri_dust.mp4',
		
		// cernunnos
		'cernunnos.mp4',

		// niantiel
		'nia_smoke.mp4',
		'nia_smoke2.mp4',
		'nia_baronsamedi.mp4',
		
		// omazu
		'omazu-fumo.mp4',
		'omazu-greysmoke.mp4',
		'omazu-redsmoke.mp4',
		'omazu-fuoco.mp4',
		'omazu-endsmoke.mp4',

		// raflifu / sol niger
		'eclypse.mp4',
		'blackhole1.mp4',
		'blackhole2.mp4',
		
		// zamradiel
		'zamradiel.mp4',
		
		// shalicu
		'chameleon.mp4',
		'shalicu.mp4',

		// lhp
		'lhp-buedonna.mp4',
		'lhp-egiziano.mp4',
		'lhp-pingpong.mp4',
		'lhp-knowledge.mp4',
		'lhp-follow_lhp.mp4',
		'lhp-turn_to_left.mp4',
		'lhp-turn_to_red.mp4',

	],
	current_video = 0,
	next_to_play_on_cycle = '',
	prev_to_play_on_cycle = '',
	video_width = 1280,
	video_height = 720,
	projecting = false;

var last_tap = null,
	tap_history = [],
	bpm = 60,
	tap_length = 1000,
	beat = 0,
	next_beat_on = 0,
	beat_timer = null,
	beat_fx = [ false,false,false,false,false,false,false,false ],
	beat_strobe = [ false,false,false,false,false,false,false,false ],
	beat_reset = [ false,false,false,false,false,false,false,false ],
	beat_shake = [ false,false,false,false,false,false,false,false ];
	beat_zoom = [ false,false,false,false,false,false,false,false ];
	
var filters = [
		"none",
		"chromase",
		"carbon",
		"noise",
		"kaleido",
	],
	current_filter = 'none',
	selected_filter = 'none';

var ui = null;

window.addEventListener( 'DOMContentLoaded', on_window_load );

function on_window_load( e )
{
	ui = {
		bpm : document.getElementById( 'bpm' ),
		src_video : document.getElementById( 'src_video' ),
		projector : null,
		projector_window : null,
		projector_container : document.getElementById( 'player' ),
		controls_window : null,
	};

	ui.projector_window = document.getElementById( 'projector' );
	ui.projector = ui.projector_window.getContext("2d");
	ui.projector.width = video_width;
	ui.projector.height = video_height;
	ui.projector_container.style.width = video_width + 'px';
	ui.projector_container.style.height = video_height + 'px';
	
	video_to_projector();
	play_current_video();
	hit_the_beat();

	
	document.getElementById( 'full_screen' ).addEventListener( 'click', on_full_screen_click );
	document.getElementById( 'open_controls' ).addEventListener( 'click', on_open_controls_click );
}

window.addEventListener( 'keydown', on_keydown );
window.addEventListener( 'keyup', on_keyup );


function on_keydown( e )
{
	e.preventDefault();
	var is_shift = !!e.shiftKey;
	
	//console.log( e.code );
	if( e.code == 'ArrowRight' )
		is_shift ? play_next() : play_next_on_cycle();

	else if( e.code == 'ArrowLeft' )
		is_shift ? play_prev() : play_prev_on_cycle();

	else if( e.code == 'KeyT' )
		set_bpm_by_tap();
	
	else if( e.code == 'KeyR' )
		play_current_video();
	
	else if( e.code == 'KeyS' )
		shake_start();
	
	else if( e.code == 'KeyC' )
		on_open_controls_click( e );
		
	else if( e.code == 'KeyF' )
		on_full_screen_click( e );
		
	else if( e.code == 'Space' )
		strobe();

	else if( e.code == 'KeyZ' )
		zoom_start();
}

function on_keyup( e )
{
	e.preventDefault();
	if( e.code == 'KeyS' )
		shake_stop();

	if( e.code == 'KeyZ' )
		zoom_stop();
}


/*
* CONTROLS
*/

function on_open_controls_click( e )
{
	e.preventDefault();
	ui.controls_window = window.open( 'controls.html', 'controls', "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,personalbar=no,width=800,height=600" );
	ui.controls_window.addEventListener( 'DOMContentLoaded', load_controls_ui );
	load_controls_ui();
}

function load_controls_ui( e )
{
	if( !ui.controls_window.document )
		return false;
	
	ui.bpm = ui.controls_window.document.getElementById( 'bpm' );
	ui.fx = ui.controls_window.document.querySelector( '.fx-seq' );
	ui.strobe = ui.controls_window.document.querySelector( '.strobe-seq' );
	ui.shake = ui.controls_window.document.querySelector( '.shake-seq' );
	ui.zoom = ui.controls_window.document.querySelector( '.zoom-seq' );
	ui.reset = ui.controls_window.document.querySelector( '.reset-seq' );
}


/*
* PROJECTOR
*/

function on_full_screen_click( e )
{
	e.preventDefault();
	ui.projector_container.requestFullscreen();
}

function video_to_projector()
{
	if( !ui.projector ) return false;
	projecting = true;
	
	if( current_filter == 'chromase' )
		filter_chromase();
	else if( current_filter == 'carbon' )
		filter_carbon();
	else if( current_filter == 'noise' )
		filter_noise();
	else if( current_filter == 'kaleido' )
		filter_kaleido();
	else
		filter_none();
	
	requestAnimationFrame( video_to_projector );
}


/*
* GLOBAL EFFECTS
*/
function shake_start()
{
	ui.projector_window.className += ' shake';
}

function shake_stop()
{
	ui.projector_window.className = ui.projector_window.className.replace( / shake/g, '' );
}

function zoom_start()
{
	ui.projector_window.className += ' zoom';
}

function zoom_stop()
{
	ui.projector_window.className = ui.projector_window.className.replace( / zoom/g, '' );
}

function strobe()
{
	var light = document.createElement( 'DIV' );
	light.className = 'strobe-light';
	ui.projector_container.appendChild( light );
	setTimeout( function() { for( i=0, c=document.querySelectorAll( 'strobe-light' ); c[i]; i++ ) { c[i].parentNode.removeChild( c[i] ); } }, 1000 );
}


/*
* FILTERS
*/

function set_filter( filter )
{
	selected_filter = filter;
}

function filter_none()
{
	ui.projector.drawImage( ui.src_video, 0, 0, video_width, video_height );
}

function filter_chromase()
{
	ui.projector.drawImage( ui.src_video, 0, 0, video_width, video_height );

	var cdata = ui.projector.getImageData( 0, 0, video_width, video_height );
	var random = Math.round( Math.random() * 30 );
	if( random <= 10 ) random = 0;
	
	for( var x=0; x < video_width; x++ )
	{
		for( var y=0; y < video_height; y++ )
		{
			var i = ( video_width * y + x ) * 4;
			cdata.data[ i ] = cdata.data[ i - random ];
			cdata.data[ i + 1 ] = cdata.data[ i + 1 + random ];
			//cdata.data[i+2]=255*cdata.data[i+2]/0xFF;
		}
	}
	ui.projector.putImageData( cdata, 0, 0 );
}

function filter_carbon()
{
	if( !window.previous_beat )
		window.previous_beat = beat;
	
	var oldcdata = ui.projector.getImageData( 0, 0, video_width, video_height );
	
	ui.projector.drawImage( ui.src_video, 0, 0, video_width, video_height );

	var cdata = ui.projector.getImageData( 0, 0, video_width, video_height );
	var rand = 150 + Math.random() * 100;
	
	for( var x=0; x < video_width; x++ )
	{
		for( var y=0; y < video_height; y++ )
		{
			var i = ( video_width * y + x ) * 4;

			if( window.previous_beat == beat )
			{
				if( cdata.data[i] < rand )
				{
					cdata.data[i] = oldcdata.data[i]*.3+rand/10;
					cdata.data[i+1] = cdata.data[i]*.3+rand/10;//oldcdata.data[i]-5;
					cdata.data[i+2] = cdata.data[i]*.3+rand/10;//oldcdata.data[i]-5;
				} else {
					cdata.data[i] = cdata.data[i]+Math.random()*30;
					cdata.data[i+1] = cdata.data[i+1]+Math.random()*30;
					cdata.data[i+2] = cdata.data[i+2]+Math.random()*30;
				}
			} else {
				cdata.data[i] = cdata.data[i]+Math.random()*30;
				cdata.data[i+1] = cdata.data[i+1]+Math.random()*30;
				cdata.data[i+2] = cdata.data[i+2]+Math.random()*30;
			}
		}
	}
	ui.projector.putImageData( cdata, 0, 0 );
	
	window.previous_beat = beat;
}

function filter_noise()
{
	ui.projector.drawImage( ui.src_video, 0, 0, video_width, video_height );

	var cdata = ui.projector.getImageData( 0, 0, video_width, video_height );
	var old_data = cdata;
	
	for( var y=0; y < video_height; y++ )
	{
		for( var x=0; x < video_width; x++ )
		{
			var random = Math.round( Math.random() * 20 ) - 10;
			var i = ( video_width * y + x ) * 4;
			cdata.data[ i ] = old_data.data[ i + random * 4 ];
			cdata.data[ i+1 ] = old_data.data[ i + 1 + random * 4 ];
			cdata.data[ i+2 ] = old_data.data[ i + 2 + random * 4 ];
//			cdata.data[ i+3 ] = cdata.data[ i + 3 + random ];
		}
	}
	ui.projector.putImageData( cdata, 0, 0 );
}

function filter_kaleido()
{
	ui.projector.drawImage( ui.src_video, 0, 0, video_width, video_height );

	var cdata = ui.projector.getImageData( 0, 0, video_width / 2 , video_height );
	var cdata2 = cdata;

	d=10;
	for( var y=0; y < video_height; y++ )
	{
		for( var x=0; x < video_width / d; x++ )
		{
			var i = ( video_width / d * y + x ) * 4;
			var c = x * 4;
			cdata2.data[ i ] = cdata.data[ i - c ];
			cdata2.data[ i + 1 ] = cdata.data[ i  - c + 1 ];
			cdata2.data[ i + 2 ] = cdata.data[ i  - c + 2 ];
		}
	}
	ui.projector.putImageData( cdata2, video_width / d, 0 );
}




/*
* VIDEOS
*/

function play_current_video()
{
	ui.src_video.src = 'videos/' + playlist[ current_video ];
	ui.src_video.width = video_width;
	ui.src_video.height = video_height;
	ui.src_video.play();
	refresh_playback_rate();

	if( ui.controls_window && ui.controls_window.mark_current_video )
	{
		ui.controls_window.mark_current_video();
	}
}

function seek_zero()
{
	ui.src_video.currentTime = 0;
	ui.src_video.play();
}

function play_this(id)
{
	current_video = id;
	if( current_video >= playlist.length )
		current_video = 0;
	
	play_current_video();
}

function play_next()
{
	current_video++;
	if( current_video >= playlist.length )
		current_video = 0;
	
	play_current_video();
}

function play_next_on_cycle()
{
	var next_video = current_video + 1;
	if( next_video >= playlist.length )
		next_video = 0;
	
	next_to_play_on_cycle = playlist[ next_video ]; 
}

function play_prev()
{
	current_video--;
	if( current_video < 0 )
		current_video = playlist.length - 1;
	play_current_video();
}

function play_prev_on_cycle()
{
	var prev_video = current_video - 1;
	if( prev_video < 0 )
		prev_video = playlist.length - 1;
	
	prev_to_play_on_cycle = playlist[ prev_video ]; 
}

function refresh_playback_rate()
{
	ui.src_video.playbackRate = bpm / 60;
	beat = 0;
	hit_the_beat();
}



/*
* TAP
*/

function set_bpm( new_bpm )
{
	bpm = new_bpm;
	if( ui.controls_window )
		ui.bpm.value = bpm;
}

function set_bpm_by_tap()
{
	// get time passed since last tap
	var now = performance.now();
	
	// is this the first tap so far (3s)? reset
	if( now - last_tap > 3000 )
	{
		reset_tap();
		last_tap = now;
		return;
	}
	
	add_tap( now - last_tap );
	
	tap_length = get_avg_tap();
	tap_bpm = Math.round( 60000 / tap_length );

	set_bpm( tap_bpm );

	last_tap = now;
	
	refresh_playback_rate();
}

function add_tap( time )
{
	tap_history.push( time );
}

function get_avg_tap()
{
	var sum = tap_history.reduce( (a, b) => a + b, 0 );
	return sum / tap_history.length;
}

function reset_tap()
{
	tap_history = [];
}


/*
* SEQUENCER
*/

function hit_the_beat()
{
	clearTimeout( beat_timer );
	
	// compensate
	next_beat_on += tap_length / 4;
	
	beat++;
	if( beat > 8 )
		beat = 1;

	if( beat == 1 && next_to_play_on_cycle != '' )
	{
		next_to_play_on_cycle = '';
		play_next();
	}

	if( beat == 1 && prev_to_play_on_cycle != '' )
	{
		prev_to_play_on_cycle = '';
		play_prev();
	}

	if( ui.controls_window && ui.controls_window.hit_the_beat )
		ui.controls_window.hit_the_beat( beat );
	
	// filter
	current_filter = ( beat_fx[ beat ] == true ? selected_filter : 'none' );
	
	// strobe
	if( beat_strobe[ beat ] )
		strobe();
	
	// shake
	if( beat_shake[ beat ] ) shake_start();
	else shake_stop();

	// zoom
	if( beat_zoom[ beat ] ) zoom_start();
	else zoom_stop();

	// strobe
	if( beat_reset[ beat ] )
		seek_zero();
		
	beat_timer = setTimeout( hit_the_beat, next_beat_on - performance.now() );
}

