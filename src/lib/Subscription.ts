import { BlogPost } from 'floatplane/creator';
import { fApi } from './FloatplaneAPI';
import Channel from './Channel';
import db from '@inrixia/db';

import type { SubscriptionSettings } from './types';
import type Video from './Video';

type LastSeenVideo = {
	guid: BlogPost['guid'];
	releaseDate: number;
};
type SubscriptionDB = {
	lastSeenVideo: LastSeenVideo;
};

export default class Subscription {
	public channels: Channel[];
	public defaultChannel: Channel;

	public readonly creatorId: string;

	private _db: SubscriptionDB;
	constructor(subscription: SubscriptionSettings) {
		this.creatorId = subscription.creatorId;

		this.channels = Object.values(subscription.channels).map((channel) => new Channel(channel, this));
		this.defaultChannel = new Channel(subscription.channels._default, this);

		// Load/Create database
		const databaseFilePath = `./db/subscriptions/${subscription.creatorId}.json`;
		try {
			this._db = db<SubscriptionDB>(databaseFilePath, { template: { lastSeenVideo: { guid: '', releaseDate: 0 } } });
		} catch {
			throw new Error(`Cannot load Subscription database file ${databaseFilePath}! Please delete the file or fix it!`);
		}
	}

	get lastSeenVideo(): SubscriptionDB['lastSeenVideo'] {
		return this._db.lastSeenVideo;
	}

	public updateLastSeenVideo(videoSeen: LastSeenVideo): void {
		if (videoSeen.releaseDate > this.lastSeenVideo.releaseDate) this._db.lastSeenVideo = videoSeen;
	}

	public deleteOldVideos = async () => {
		for (const channel of this.channels) await channel.deleteOldVideos();
	};

	/**
	 * @param {fApiVideo} video
	 */
	public addVideo(video: BlogPost, overrideSkip: true, stripSubchannelPrefix?: boolean): ReturnType<Channel['addVideo']>;
	public addVideo(video: BlogPost, overrideSkip?: false, stripSubchannelPrefix?: boolean): ReturnType<Channel['addVideo']> | null;
	public addVideo(video: BlogPost, overrideSkip = false, stripSubchannelPrefix = true): ReturnType<Channel['addVideo']> | null {
		for (const channel of this.channels) {
			// Check if the video belongs to this channel
			if (channel.identifiers === false) continue;
			for (const identifier of channel.identifiers) {
				if (typeof identifier.type !== 'string')
					throw new Error(
						`Video value for channel identifier type ${video[identifier.type]} on channel ${channel.title} is of type ${typeof video[identifier.type]} not string!`
					);
				else {
					// Description is named text on videos, kept description for ease of use for users but have to change it here...
					const identifierType = identifier.type === 'description' ? 'text' : identifier.type;

					if ((video[identifierType] as string).toLowerCase().indexOf(identifier.check.toLowerCase()) !== -1) {
						if (overrideSkip === false && channel.skip === true) return null;
						// Remove the identifier from the video title if to give a nicer title
						const idCheck = identifier.check.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
						const regIDCheck = new RegExp(idCheck, 'i');
						if (identifierType === 'title' && stripSubchannelPrefix === true) video.title = video.title.replace(regIDCheck, '').trim();
						return channel.addVideo(video);
					}
				}
			}
		}
		if (overrideSkip === false && this.defaultChannel.skip === true) return null;
		return this.defaultChannel.addVideo(video);
	}

	public async fetchNewVideos(videosToSearch = 20, stripSubchannelPrefix: boolean, forceFullSearch: boolean): Promise<Array<Video>> {
		const coloredTitle = `${this.defaultChannel.consoleColor || '\u001b[38;5;208m'}${this.defaultChannel.title}\u001b[0m`;

		const videos = [];

		process.stdout.write(`> Fetching latest videos from [${coloredTitle}]... Fetched ${videos.length} videos!`);

		for await (const video of fApi.creator.blogPostsIterable(this.creatorId, { type: 'video' })) {
			if (!forceFullSearch && video.guid === this.lastSeenVideo.guid) {
				// If we have found the last seen video, check if its downloaded.
				// If it is then break here and return the videos we have found.
				// Otherwise continue to fetch new videos up to the videosToSearch limit to ensure partially or non downloaded videos are returned.
				const channelVideo = this.addVideo(video, true, stripSubchannelPrefix);
				if (channelVideo === null || (await channelVideo.isDownloaded())) break;
			}
			// Stop searching if we have looked through videosToSearch
			if (videos.length >= videosToSearch) break;
			videos.push(video);
			process.stdout.write(`\r> Fetching latest videos from [${coloredTitle}]... Fetched ${videos.length} videos!`);
		}

		// Make sure videos are in correct order for episode numbering, null episodes are part of a channel that is marked to be skipped
		const incompleteVideos = (
			await Promise.all(
				videos
					.sort((a, b) => +new Date(a.releaseDate) - +new Date(b.releaseDate))
					.map(async (video) => {
						const subVideo = this.addVideo(video, false, stripSubchannelPrefix);
						if (subVideo === null) return null;
						if ((await subVideo.isMuxed()) === true) return null;
						return subVideo;
					})
			)
		).filter(notNull);
		process.stdout.write(` Skipped ${videos.length - incompleteVideos.length}.\n`);
		return incompleteVideos;
	}
}

// This is used to allow typescript to enforce strict type checking
const notNull = <T>(value: T | null): value is T => value !== null;
