import { useState, useEffect } from "react";
import Temp010GoochyComponent from "./Temp010GoochyComponent";
import { DataService } from "../../services/DataService";
import { NavLink } from "react-router-dom";
import { Temp010GoochyEntry } from "../model/model";

interface Temp010GoochyProps {
	dataService: DataService;
}

export default function Temp010Goochy(props: Temp010GoochyProps) {
	const [temp010Goochy, setTemp010Goochy] = useState<Temp010GoochyEntry[]>();
	const [reservationText, setReservationText] = useState<string>();

	useEffect(() => {
		const getTemp010Goochy = async () => {
			console.log("getting temp010Goochy....");
			const temp010Goochy = await props.dataService.getTemp010Goochy();
			setTemp010Goochy(temp010Goochy);
		};
		getTemp010Goochy();
	}, []); //Keep the array empty to run the effect only once (otherwise it will run on every render and cost $$)

	async function reserveTemp010Goochy(
		temp010GoochyId: string,
		temp010GoochyName: string
	) {
		const reservationResult = await props.dataService.reserveTemp010Goochy(
			temp010GoochyId
		);
		setReservationText(
			`You reserved ${temp010GoochyName}, reservation id: ${reservationResult}`
		);
	}

	function renderTemp010Goochy() {
		if (!props.dataService.isAuthorized()) {
			return <NavLink to={"/login"}>Please login</NavLink>;
		}
		const rows: any[] = [];
		if (temp010Goochy) {
			for (const temp010GoochyEntry of temp010Goochy) {
				rows.push(
					<Temp010GoochyComponent
						key={temp010GoochyEntry.id}
						id={temp010GoochyEntry.id}
						location={temp010GoochyEntry.location}
						name={temp010GoochyEntry.name}
						photoUrl={temp010GoochyEntry.photoUrl}
						reserveTemp010Goochy={reserveTemp010Goochy}
					/>
				);
			}
		}

		return rows;
	}

	return (
		<div>
			<h2>Welcome to the Temp010Goochy page!</h2>
			{reservationText ? <h2>{reservationText}</h2> : undefined}
			{renderTemp010Goochy()}
		</div>
	);
}
