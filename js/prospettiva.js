/* )c( 2019 kalamun.net */

// all videos should be recorded at 60 bpm
var playlist = [],
	playlist_linear = [],
	filesystem = {},
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
	
var ui = null;

window.addEventListener( 'DOMContentLoaded', on_window_load );

function on_window_load( e )
{
	ui = {
		bpm : document.getElementById( 'bpm' ),
		src_video : document.getElementById( 'src_video' ),
		projector_container: document.getElementById( 'player' ),
		controls_window : null,
	};

	document.getElementById( 'open_directory' ).addEventListener( 'click', on_open_directory_click );
	document.getElementById( 'full_screen' ).addEventListener( 'click', on_full_screen_click );
	document.getElementById( 'open_controls' ).addEventListener( 'click', on_open_controls_click );
}

function start_projecting() {
	play_current_video();
	hit_the_beat();
}

window.addEventListener( 'keydown', on_keydown );
window.addEventListener( 'keyup', on_keyup );


function on_keydown( e )
{
	if(!["F3", "F5", "F12"].includes(e.code)) {
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

async function on_open_directory_click( e )
{
	// Recursive function that walks the directory structure.
	const getFiles = async (dirHandle, path = dirHandle.name) => {
		const dirs = [];
		const files = [];
		for await (const entry of dirHandle.values()) {
			const nestedPath = `${path}/${entry.name}`;
			if (entry.kind === "file") {
				files.push(
					entry.getFile().then((file) => {
						file.directoryHandle = dirHandle;
						file.handle = entry;
						return Object.defineProperty(file, "webkitRelativePath", {
							configurable: true,
							enumerable: true,
							get: () => nestedPath,
						});
					})
				);
			} else if (entry.kind === "directory") {
				dirs.push(getFiles(entry, nestedPath));
			}
		}
		return [
			...(await Promise.all(dirs)).flat(),
			...(await Promise.all(files)),
		];
	}

	const handle = await window.showDirectoryPicker();
	const directoryStructure = await getFiles(handle, undefined);

	const playlistFile = directoryStructure.find(file => file.name === "playlist.json");
	if (playlistFile) {
		filesystem = directoryStructure;
		const file = await playlistFile.handle.getFile();
		const contents = await file.text();
		playlist = JSON.parse(contents);
		playlist_linear = Object.entries(playlist).map(([track, entry]) => entry.visuals.map(file => ({file, track}))).flat();
		start_projecting();
	}
}

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



/*
* GLOBAL EFFECTS
*/
function shake_start()
{
	document.body.classList.add('shake');
}

function shake_stop()
{
	document.body.classList.remove('shake');
}

function zoom_start()
{
	document.body.classList.add('zoom');
}

function zoom_stop()
{
	document.body.classList.remove('zoom');
}

function strobe()
{
	const light = document.createElement( 'DIV' );
	light.className = 'strobe-light';
	ui.projector_container.appendChild( light );
	setTimeout( function() { for( i=0, c=document.querySelectorAll( '.strobe-light' ); c[i]; i++ ) { c[i].parentNode.removeChild( c[i] ); } }, 1000 );
}





/*
* VIDEOS
*/

function play_current_video()
{
	const playlist_entry = playlist_linear[current_video];
	const current_video_file = filesystem.find(entry => entry.directoryHandle?.name === playlist_entry.track && entry.handle?.name === playlist_entry.file);
	ui.src_video.src = URL.createObjectURL(current_video_file);
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

