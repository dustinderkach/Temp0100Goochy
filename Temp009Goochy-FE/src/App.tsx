import "./App.css";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import { useState } from "react";
import LoginComponent from "./components/LoginComponent";
import { AuthService } from "./services/AuthService";
import { DataService } from "./services/DataService";
import CreateTemp009Goochy from "./components/temp009Goochy/CreateTemp009Goochy";
import Temp009Goochy from "./components/temp009Goochy/Temp009Goochy";

const authService = new AuthService();
const dataService = new DataService(authService);

function App() {
	const [userName, setUserName] = useState<string | undefined>(undefined);

	const router = createBrowserRouter([
		{
			element: (
				<>
					<NavBar userName={userName} />
					<Outlet />
				</>
			),
			children: [
				{
					path: "/",
					element: <div>Hello world!</div>,
				},
				{
					path: "/login",
					element: (
						<LoginComponent
							authService={authService}
							setUserNameCb={setUserName}
						/>
					),
				},
				{
					path: "/profile",
					element: <div>Profile page</div>,
				},
				{
					path: "/createTemp009Goochy",
					element: <CreateTemp009Goochy dataService={dataService} />,
				},
				{
					path: "/temp009Goochy",
					element: <Temp009Goochy dataService={dataService} />,
				},
			],
		},
	]);

	return (
		<div className="wrapper">
			<RouterProvider router={router} />
		</div>
	);
}

export default App;
