import { useState, useEffect } from "react";
import Temp009GoochyComponent from "./Temp009GoochyComponent";
import { DataService } from "../../services/DataService";
import { NavLink } from "react-router-dom";
import { Temp009GoochyEntry } from "../model/model";

interface Temp009GoochyProps {
	dataService: DataService;
}

export default function Temp009Goochy(props: Temp009GoochyProps) {
	const [temp009Goochy, setTemp009Goochy] = useState<Temp009GoochyEntry[]>();
	const [reservationText, setReservationText] = useState<string>();

	useEffect(() => {
		const getTemp009Goochy = async () => {
			console.log("getting temp009Goochy....");
			const temp009Goochy = await props.dataService.getTemp009Goochy();
			setTemp009Goochy(temp009Goochy);
		};
		getTemp009Goochy();
	}, []); //Keep the array empty to run the effect only once (otherwise it will run on every render and cost $$)

	async function reserveTemp009Goochy(
		temp009GoochyId: string,
		temp009GoochyName: string
	) {
		const reservationResult = await props.dataService.reserveTemp009Goochy(
			temp009GoochyId
		);
		setReservationText(
			`You reserved ${temp009GoochyName}, reservation id: ${reservationResult}`
		);
	}

	function renderTemp009Goochy() {
		if (!props.dataService.isAuthorized()) {
			return <NavLink to={"/login"}>Please login</NavLink>;
		}
		const rows: any[] = [];
		if (temp009Goochy) {
			for (const temp009GoochyEntry of temp009Goochy) {
				rows.push(
					<Temp009GoochyComponent
						key={temp009GoochyEntry.id}
						id={temp009GoochyEntry.id}
						location={temp009GoochyEntry.location}
						name={temp009GoochyEntry.name}
						photoUrl={temp009GoochyEntry.photoUrl}
						reserveTemp009Goochy={reserveTemp009Goochy}
					/>
				);
			}
		}

		return rows;
	}

	return (
		<div>
			<h2>Welcome to the Temp009Goochy page!</h2>
			{reservationText ? <h2>{reservationText}</h2> : undefined}
			{renderTemp009Goochy()}
		</div>
	);
}
