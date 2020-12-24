import { MyPlexAccount } from "@ctrl/plex";

// (async () => {
// 	const account 
// 	const resource = await account.resource("<SERVERNAME>");
// 	const plex = await resource.connect();
// 	const library = await plex.library();
// 	(await library.section("sectionname")).refresh();
// })();

import MultiProgress from "multi-progress";
const multiProgressBar = new MultiProgress(process.stdout);

// const downloadVideo = video => { // This handles resuming downloads, its very similar to the download function with some changes
// 	let videoSize = videos[video.guid].size ? videos[video.guid].size : 0; // // Set the total size to be equal to the stored total or 0
// 	const videoDownloadedBytes = videos[video.guid].transferred ? videos[video.guid].transferred : 0; // Set previousTransferred as the previous ammount transferred or 0
// 	const fileOptions = { start: videoDownloadedBytes, flags: videos[video.guid].file ? "r+" : "w" };
// 	let displayTitle = "";
// 	// If this video was partially downloaded
// 	if (videos[video.guid].partial) displayTitle = pad(`${colourList[video.subChannel]}${video.subChannel}\u001b[0m> ${video.title.slice(0,35)}`, 36); // Set the title for being displayed and limit it to 25 characters
// 	else displayTitle = pad(`${colourList[video.subChannel]}${video.subChannel}\u001b[0m> ${video.title.slice(0,25)}`, 29); // Set the title for being displayed and limit it to 25 characters
	
// 	const bar = multi.newBar(":title [:bar] :percent :stats", { // Create a new loading bar
// 		complete: "\u001b[42m \u001b[0m",
// 		incomplete: "\u001b[41m \u001b[0m",
// 		width: 30,
// 		total: 100
// 	});
// 	progress(floatRequest({ // Request to download the video
// 		url: video.url,
// 		headers: (videos[video.guid].partial) ? { // Specify the range of bytes we want to download as from the previous ammount transferred to the total, meaning we skip what is already downlaoded
// 			Range: `bytes=${videos[video.guid].transferred}-${videos[video.guid].size}`
// 		} : {}
// 	}), {throttle: settings.downloadUpdateTime}).on("progress", function (state) { // Run the below code every downloadUpdateTime while downloading
// 		if (!videos[video.guid].size) {
// 			videos[video.guid].size = state.size.total;
// 			videos[video.guid].partial = true;
// 			videos[video.guid].file = video.rawPath+video.title+".mp4.part";
// 			saveVideoData();
// 		}
// 		// Set the amount transferred to be equal to the preious ammount plus the new ammount transferred (Since this is a "new" download from the origonal transferred starts at 0 again)
// 		if (state.speed == null) {state.speed = 0;} // If the speed is null set it to 0
// 		bar.update((videoDownloadedBytes+state.size.transferred)/videos[video.guid].size); // Update the bar's percentage with a manually generated one as we cant use progresses one due to this being a partial download
// 		// Tick the bar same as above but the transferred value needs to take into account the previous amount.
// 		bar.tick({"title": displayTitle, "stats": `${((state.speed/100000)/8).toFixed(2)}MB/s ${((videoDownloadedBytes+state.size.transferred)/1024000).toFixed(0)}/${((videoDownloadedBytes+state.size.total)/1024000).toFixed(0)}MB ETA: ${Math.floor(state.time.remaining/60)}m ${Math.floor(state.time.remaining)%60}s`});
// 		videoSize = (videoDownloadedBytes+state.size.total/1024000).toFixed(0); // Update Total for when the download finishes
// 		//savePartialData(); // Save this data
// 	}).on("error", function(err, stdout, stderr) { // On a error log it
// 		if (videos[video.guid].partial) fLog(`Resume > An error occoured for "${video.title}": ${err}`);
// 		else fLog("Download > An error occoured for \""+video.title+"\": "+err);
// 		console.log(`An error occurred: ${err.message} ${err} ${stderr}`);
// 	}).on("end", function () { // When done downloading
// 		fLog(`Download > Finished downloading: "${video.title}"`);
// 		bar.update(1); // Set the progress bar to 100%
// 		// Tick the progress bar to display the totalMB/totalMB
// 		bar.tick({"title": displayTitle, "stats": `${(videoSize/1024000).toFixed(0)}/${(videoSize/1024000).toFixed(0)}MB`});
// 		bar.terminate();
// 		videos[video.guid].partial = false;
// 		videos[video.guid].saved = true;
// 		saveVideoData();
// 		queueCount -= 1; // Reduce queueCount by 1
// 	// Write out the file to the partial file previously saved. But write with read+ and set the starting byte number (Where to start wiriting to the file from) to the previous amount transferred
// 	}).pipe(fs.createWriteStream(video.rawPath+video.title+".mp4.part", fileOptions)).on("finish", function(){ // When done writing out the file
// 		fs.rename(video.rawPath+video.title+".mp4.part", video.rawPath+video.title+".mp4", function(){
// 			videos[video.guid].file = video.rawPath+video.title+".mp4"; // Specifies where the video is saved
// 			saveVideoData();
// 			const temp_file = video.rawPath+"TEMP_"+video.title+".mp4"; // Specify the temp file to write the metadata to
// 			ffmpegFormat(temp_file, video); // Format with ffmpeg for titles/plex support
// 		}); // Rename it without .part
// 	});
// };