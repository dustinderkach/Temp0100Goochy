import genericImage from "../../assets/generic-photo.jpg";
import { Temp010GoochyEntry } from "../model/model";
import "./Temp010GoochyComponent.css";

interface Temp010GoochyComponentProps extends Temp010GoochyEntry {
	reserveTemp010Goochy: (temp010GoochyId: string, temp010GoochyName: string) => void;
}

export default function Temp010GoochyComponent(props: Temp010GoochyComponentProps) {
	function renderImage() {
		if (props.photoUrl) {
			return <img src={props.photoUrl} />;
		} else {
			return <img src={genericImage} />;
		}
	}

	return (
		<div className="temp010GoochyComponent">
			{renderImage()}
			<label className="name">{props.name}</label>
			<br />
			<label className="location">{props.location}</label>
			<br />
			<button
				onClick={() => props.reserveTemp010Goochy(props.id, props.name)}
			>
				Reserve
			</button>
		</div>
	);
}
