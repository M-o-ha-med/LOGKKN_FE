export type Logs =  {
	log_id : number;
	title : string;
	image_url : string[];
	content : string;
	slug : string;
}

export type Project =  {
	title : string;
	description : string;
	coverImages : string[];
	conceptImages : string[];
	exteriorImages : string[];
	interiorImages: string[];
}

export type Tag = {
	tag_name : string;
	article_id : number;
}

export type Comment = {
	commment_id : number;
	comment_name : string,
	comment_content : string,
	article_id : number;

}

export type ProjectPhoto = {
  photo_type: 'COVER' | 'CONCEPT' | 'EXTERIOR' | 'INTERIOR' | string;
  url_photo: string;
};

export type ThumbnailImageProps = {
	url: string;
	index: number;
	onRemove: (url : string) => void;
};
	
export type LogImages = {
	image_url : string,
	image_fileid : string,
	logbook_images_id : number,
}