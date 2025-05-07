import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Sector,
} from 'recharts';
import { useState, useEffect } from 'react';

const ExpensePieChart = ({ data }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);

		return () => {
			window.removeEventListener('resize', checkIfMobile);
		};
	}, []);

	const renderActiveShape = (props) => {
		const {
			cx,
			cy,
			innerRadius,
			outerRadius,
			startAngle,
			endAngle,
			fill,
			payload,
			percent,
		} = props;

		const labelSize = isMobile ? 12 : 14;
		const valueSize = isMobile ? 14 : 16;
		const percentSize = isMobile ? 10 : 12;
		const spacing = isMobile ? 10 : 15;

		return (
			<g>
				<text
					x={cx}
					y={cy - spacing}
					dy={8}
					textAnchor="middle"
					fill="#333"
					fontSize={labelSize}
				>
					{payload.name}
				</text>
				<text
					x={cx}
					y={cy + spacing}
					dy={8}
					textAnchor="middle"
					fill="#333"
					fontSize={valueSize}
					fontWeight="bold"
				>
					{`৳${payload.value.toLocaleString()}`}
				</text>
				<text
					x={cx}
					y={cy + spacing * 2.5}
					dy={8}
					textAnchor="middle"
					fill="#666"
					fontSize={percentSize}
				>
					{`(${(percent * 100).toFixed(2)}%)`}
				</text>
				<Sector
					cx={cx}
					cy={cy}
					innerRadius={innerRadius}
					outerRadius={outerRadius + (isMobile ? 5 : 10)}
					startAngle={startAngle}
					endAngle={endAngle}
					fill={fill}
				/>
			</g>
		);
	};

	const onPieEnter = (_, index) => {
		setActiveIndex(index);
	};

	return (
		<ResponsiveContainer width="100%" height="100%">
			<PieChart
				margin={
					isMobile
						? { top: 0, right: 0, bottom: 0, left: 0 }
						: { top: 5, right: 30, bottom: 5, left: 5 }
				}
			>
				<Pie
					activeIndex={activeIndex}
					activeShape={renderActiveShape}
					data={data}
					cx="50%"
					cy="50%"
					innerRadius={isMobile ? 60 : 80}
					outerRadius={isMobile ? 85 : 110}
					fill="#8884d8"
					dataKey="value"
					nameKey="name"
					onMouseEnter={onPieEnter}
				>
					{data.map((entry, index) => (
						<Cell key={`cell-${index}`} fill={entry.color} />
					))}
				</Pie>

				{!isMobile ? (
					<Legend layout="vertical" align="right" verticalAlign="middle" />
				) : (
					<Legend layout="horizontal" align="center" verticalAlign="bottom" />
				)}
			</PieChart>
		</ResponsiveContainer>
	);
};

export default ExpensePieChart;
