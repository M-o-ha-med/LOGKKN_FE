import { ImCross } from 'react-icons/im';
  

	
const ThumbnailImage = ({ url, index , onRemove}: {url : string,  index : number , onRemove: (url: string) => void}) => {
	return(
	<div className="relative">
		<div className="absolute bg-red-700 top-0 right-0 rounded-md w-6 h-6 flex  items-center">
			<button type="button" onClick = {() => onRemove(url)} className="mx-auto">{<ImCross style={{color : 'white'}}/>}</button>
		</div>
         <img
              key={index}
              src={url}
              alt={`Preview ${index + 1}`}
              className="h-20 w-20 object-cover rounded-md"
         />
	</div>
	)
  
}

export default ThumbnailImage;