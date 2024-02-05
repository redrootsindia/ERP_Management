import React, { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client'
import moment from 'moment'
import { Spin } from 'antd'
import { useHistory } from 'react-router-dom'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'
import { DASHBOARD_CALENDAR } from './queries'

const Calendar = () => {
  const [calendarDateFilter, setCalendarDateFilter] = useState([])
  const [events, setEvents] = useState([])
  const history = useHistory()

  const {
    loading: dashboardCalendarLoad,
    error: dashboardCalendarErr,
    data: dashboardCalendarData,
  } = useQuery(DASHBOARD_CALENDAR, {
    variables: { calendarDateFilter },
  })

  useEffect(() => {
    if (
      !dashboardCalendarLoad &&
      dashboardCalendarData &&
      dashboardCalendarData.dashboardCalendar &&
      dashboardCalendarData.dashboardCalendar.length
    ) {
      const tempEvents = []
      dashboardCalendarData.dashboardCalendar.map((e) =>
        tempEvents.push({
          title: `${e.po_type === 'product' ? `Product PO #${e.id}` : `Material PO #${e.id}`}`,
          start: moment(Number(e.due_date)).format('YYYY-MM-DD'),
          id: `${e.id}`,
        }),
      )
      setEvents(tempEvents)
    } else setEvents([])
  }, [dashboardCalendarData, dashboardCalendarLoad])

  const handleClick = (arg) => {
    if (arg.event.title === `Product PO #${arg.event.id}`) {
      history.push(`/purchase-orders/product/update/${arg.event.id}`)
    }
    if (arg.event.title === `Material PO #${arg.event.id}`) {
      history.push(`/purchase-orders/material/update/${arg.event.id}`)
    }
  }
  if (dashboardCalendarErr)
    return `Error occured while fetching data: ${dashboardCalendarErr.message}`

  return (
    <div>
      <div className="card">
        <div className="card-body">
          <Spin spinning={dashboardCalendarLoad} tip="Loading...">
            <FullCalendar
              defaultView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              datesSet={(arg) => {
                setCalendarDateFilter([
                  String(arg.view.activeStart.valueOf()),
                  String(arg.view.activeEnd.valueOf()),
                ])
              }}
              plugins={[dayGridPlugin, timeGridPlugin]}
              events={events}
              eventClick={(arg) => handleClick(arg)}
            />
          </Spin>
        </div>
      </div>
    </div>
  )
}

export default Calendar
