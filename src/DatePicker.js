import React, { useEffect, useMemo, useState } from "react";
import './DatePicker.css';
import { v4 } from "uuid";


const DateRangePicker =  (props)  => {
    const {
		
	} = props
	const mode = {task1: '1', task2: '2'};
    const noneDate = '-/-/-'
    const today = new Date(Date.now());
	const [taskMode, setTaskMode] = useState(mode.task1);
    const [lastClickedDate, setLastClickedDate] = useState(today);
    const [minDate, setMinDate] = useState(noneDate);
    const [maxDate, setMaxDate] = useState(noneDate);
    const [PopupSwitch, setPopupSwitch] = useState(false);

	useEffect(() => {
		setLastClickedDate(today);
		setMinDate(noneDate);
		setMaxDate(noneDate);
	}, [taskMode])


    const Calendar = (props) => {
        const {
			today,
			taskMode,
            lastClickedDate,
			setLastClickedDate,
            minDate,
            setMinDate,
            setMaxDate,
        } = props

        const [currentMonth, setCurrentMonth] = useState(lastClickedDate.getMonth()+1);
        const [currentYear, setCurrentYear] = useState(lastClickedDate.getFullYear());
        const clickEvent = {prev: 'prev', next: 'next'};

        const handlCurrent = (event) => {
            let newMonth;
            switch (event) {
                case clickEvent.prev:
                    newMonth = currentMonth - 1
                    break;
                case clickEvent.next:
                    newMonth = currentMonth + 1
                    break;
                default:
                    break;
            }

            if (newMonth === 0)  { setCurrentMonth(12); setCurrentYear(currentYear-1); return; }
            if (newMonth === 13) { setCurrentMonth(1); setCurrentYear(currentYear+1); return; }

            setCurrentMonth(newMonth); 
            return;
        }

		const DateTable = (props) => {
			const {currentMonth, currentYear, taskMode} = props;
			const weekList = ['一', '二', '三', '四', '五', '六', '日'];
			
			const days = useMemo(() => {
				const isSunday = (day) => day === 0 ? true : false;
				const prevMonth = new Date(currentYear, currentMonth -1);
				const nextMonth = new Date(currentYear, currentMonth +1);
				const daysOfMonth = new Date(currentYear, currentMonth, 0).getDate();
				const daysOfLastMonth = new Date(currentYear, currentMonth -1, 0).getDate();
				const weekOfFirstDate = new Date(currentYear, currentMonth -1, 1).getDay();
				const weekOfLastDate = new Date(currentYear, currentMonth, 0).getDay();
				const lastMonthDays = isSunday(weekOfFirstDate) ? 6 : weekOfFirstDate - 1;
				const nextMonthDays = isSunday(weekOfLastDate) ? 0 : 7 - weekOfLastDate;
				const startDate = daysOfLastMonth - lastMonthDays + 1;
				const daysList = [];
				
				for (let i = startDate; i <= daysOfLastMonth; i++) 
					daysList.push({year: prevMonth.getFullYear(), month: prevMonth.getMonth(), day:i});
				for (let i = 1; i <= daysOfMonth; i++) 
					daysList.push({year: currentYear, month: currentMonth, day:i});
				for (let i = 1; i <= nextMonthDays; i++) 
					daysList.push({year: nextMonth.getFullYear(), month: nextMonth.getMonth(), day:i});


				return daysList;
			}, [currentYear, currentMonth])

			const handleClick = (year, month, day) => {
				const clickDate = new Date(year, month-1, day);
				const clickDateString = `${clickDate.getFullYear()}-${clickDate.getMonth()+1}-${clickDate.getDate()}`
				const minDateString = minDate.replace(noneDate, '');
				const startDate = new Date(minDateString);

				if (!minDateString || (clickDate < startDate)) setMinDate(clickDateString);
				else setMaxDate(clickDateString); 
				setLastClickedDate(clickDate);
			}

			const Week = (props) => {
				const {daysOfWeekList, taskMode} = props;
				const isTask1Mode = taskMode === mode.task1;

				const isDuringDate = (current) => {
					if (!minDate.replace(noneDate, '')) return false;
					const date = new Date(current.year, current.month-1, current.day);
					const startDate = new Date(minDate.replace(noneDate, ''));
					const endDate = new Date(maxDate.replace(noneDate, ''));
					if (current.year === startDate.getFullYear() &&
						current.month === startDate.getMonth() +1 &&
						current.day === startDate.getDate()) {
						return true;
					}

					if (date >= startDate && date<=endDate ) {
						return true;
					}
					return false;
				}

				
				const TdGroup = daysOfWeekList.map(e => {
					const isToday = e.year === today.getFullYear() && e.month === today.getMonth()+1 && e.day === today.getDate();
					const isCurrentMon = e.month === currentMonth;
					const isDuringDay = isDuringDate(e);

					const setClassName = () => {
						return `day \
								${isCurrentMon ? '' : 'non-current-month'} \
								${isTask1Mode && !isCurrentMon ? 'click-forbid' : 'pointer'} \
								${isDuringDay ? 'active' : ''}\
								${isToday? 'today' : '' }`
					}
					const setClickEvent = () => {
						return isTask1Mode && !isCurrentMon ? undefined : () => {handleClick(e.year, e.month, e.day)};
					}

					return (
						<td 
							key={v4()}
							className={setClassName()}
							onClick = {setClickEvent()}
							>
							{`${e.day}日`}
						</td>
					)}
				);

				return ( 
					<tr>
						{TdGroup}
					</tr>
				)
			}; 


			const weeksGroup = (days) => {
				const weeks = []
				for(let i=1; i <= (days.length / 7); i++){
					weeks.push(i)
				}
				const weeksGroup = weeks.map(e => 
					<Week 
						key={v4()}
						daysOfWeekList={days.slice((e-1)*7, e*7)}
						taskMode={taskMode}
					/>
				)

				return weeksGroup
			} 


			return(
				<table className="text-center w-100">
					<thead>
						<tr>
							{weekList.map(e => <th key={v4()}>{e}</th>)}
						</tr>
					</thead>
					<tbody>
						{weeksGroup(days)}
					</tbody>
				</table>
			)
		}

		const isTask1Mode = taskMode === mode.task1;
        
        return(
            <div className="border w-350 font-size-16">
                <div className={`flex text-center line-h-44 ${isTask1Mode ? 'justify-center' : 'justify-between'}`}>
                    <span 
						onClick={()=>handlCurrent(clickEvent.prev)} 
						className={`button ${isTask1Mode ? 'hidden' : 'pointer'}`}>
							{`<`}
					</span>
                    <span
						className={``}>
						{currentYear}年{currentMonth}月
					</span>
                    <span 
						onClick={()=>handlCurrent(clickEvent.next)} 
						className={`button ${isTask1Mode ? 'hidden' : 'pointer'}`}>
							{`>`}
					</span>
                </div>
                <div>
					{<DateTable key={v4()} currentYear={currentYear} currentMonth={currentMonth} taskMode={taskMode}/>}
                </div>
            </div>
        )
    }


  
    return (
      	<div className="margin-10">
			<div className="margin-bottom-10 ">
				<select onChange={(e)=>setTaskMode(e.target.value)} className="w-350 padding-10 font-size-16">
					<option value={mode.task1}>{'task-1 (current month)'}</option>
					<option value={mode.task2}>{'task-2 (cross months)'}</option>
				</select>
			</div>
			<button 
				className="w-350 padding-10 font-size-16"
				onClick={()=>setPopupSwitch(PopupSwitch? false : true)}>
				{`${minDate} ~ ${maxDate}`}
			</button>
			{PopupSwitch && 
				<Calendar 
					key={v4()}
					today={today}
					taskMode={taskMode}
					lastClickedDate={lastClickedDate}
					setLastClickedDate={setLastClickedDate}
					minDate={minDate}
					setMinDate={setMinDate}
					setMaxDate={setMaxDate}
				/>}
     	</div>
    );
}

export default DateRangePicker;
