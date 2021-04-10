const AppReducer = (state = { User: {} }, action) => {
	switch (action.type) {
		case 'ADD':
			return {
				...state,
				User: action.payload,
			};

		default:
			return state;
	}
};

export default AppReducer;
