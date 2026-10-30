// Shared ocean art direction. Each scene deforms in place under a fixed viewpoint.
window.STASSINOS_EXHIBITS = Object.freeze({
  home: {index:0, number:'01', title:'The living sea', subtitle:'An open horizon in motion', motion:'Layered ocean swells, crest foam and refracted silver light', accent:'173, 217, 209', palette:['#b9cab5','#278a91','#b9ece1']},
  bot: {index:1, number:'02', title:'The spiral current', subtitle:'Water folding into a slow eddy', motion:'Three broad spiral arms, flowing foam lace, ripples and a deep current eye', accent:'185, 218, 207', palette:['#cbd5bf','#317f82','#b7e8d3']},
  memory: {index:2, number:'03', title:'The glass tide', subtitle:'Light moving through a rippling tidal pool', motion:'Intersecting expanding ripples, flowing caustic cells and silver water reflections', accent:'177, 215, 218', palette:['#d2cebd','#287d91','#beece5']},
  history: {index:3, number:'04', title:'The pelagic bell', subtitle:'An illuminated deep-water medusa', motion:'A scalloped breathing bell, moving ribs, folded oral arms and fifteen trailing filaments', accent:'205, 193, 221', palette:['#c6b6dc','#7e6bad','#b9e8ed']},
  trajectory: {index:4, number:'05', title:'The silver current', subtitle:'A manta moving with the water', motion:'Flexing fin membranes, fan ribs, head details, a trailing tail and refracted wakes', accent:'181, 214, 224', palette:['#adbdbd','#50879e','#c1e9ed']},
  metrics: {index:5, number:'06', title:'The falling river', subtitle:'A curtain of liquid light', motion:'Layered water curtains, folded sheets, rolling mist, pool caustics and expanding ripples', accent:'188, 219, 201', palette:['#bcbf9c','#429d94','#d0eace']},
  console: {index:6, number:'07', title:'The luminous tide', subtitle:'The edge of a glowing sea', motion:'A breathing shoreline, travelling surf and bioluminescent water', accent:'176, 210, 222', palette:['#bcae87','#306483','#80e3e3']},
});
window.STASSINOS_MOTION = Object.freeze({duration:1600, easing:'cubic-bezier(.22, .65, .25, 1)'});
