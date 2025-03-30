import genericImage from "../../assets/generic-photo.jpg";
import { Temp009GoochyEntry } from "../model/model";
import "./Temp009GoochyComponent.css";

interface Temp009GoochyComponentProps extends Temp009GoochyEntry {
	reserveTemp009Goochy: (temp009GoochyId: string, temp009GoochyName: string) => void;
}

export default function Temp009GoochyComponent(props: Temp009GoochyComponentProps) {
	function renderImage() {
		if (props.photoUrl) {
			return <img src={props.photoUrl} />;
		} else {
			return <img src={genericImage} />;
		}
	}

	return (
		<div className="temp009GoochyComponent">
			{renderImage()}
			<label className="name">{props.name}</label>
			<br />
			<label className="location">{props.location}</label>
			<br />
			<button
				onClick={() => props.reserveTemp009Goochy(props.id, props.name)}
			>
				Reserve
			</button>
		</div>
	);
}
