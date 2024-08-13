import { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import BModal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styled, { createGlobalStyle } from 'styled-components';
import moment from 'moment';
import axios from '../api/axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const GET_URL = SERVER_URL + 'api/my_reservations';
const CONTENT_WIDTH = 650;

// Global Style to apply the gradient to the entire page, including the body
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    height: 100vh;
    background: linear-gradient(to bottom, #D1A272, white);
    font-family: Arial, sans-serif;
  }

  #root {
    height: 100%;
  }
`;

// Main wrapper with the same gradient as a fallback
const MainWrapper = styled.div`
  min-height: 100vh;
  
`;

const ElementStyle = styled.div`
  .wrapper_month {
    width: ${CONTENT_WIDTH + 120}px;
    padding: 0 10px;
    font-weight: bold;
    text-align: left;
    background-color: lightgray;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom: 2px solid #dee2e6;
  }

  table {
    width: ${CONTENT_WIDTH + 120}px;
    position: relative;

    td {
      padding: 0;
      height: 28px;
      background: lightgray;
      border-bottom-width: 2px;
    }

    td:nth-child(1) {
      width: 65px;
      text-align: left;
      padding-left: 4px;
    }

    td:nth-child(2) {
      width: ${CONTENT_WIDTH}px;
      position: relative;
    }

    td:nth-child(3) {
      width: 46px;
    }

    tr.today td {
      background: #d8d85a;
    }

    div.today {
      background-color: lightgray;
      position: absolute;
      right: -180px;
      width: 120px;
      height: 25px;
    }

    div.today:before {
      width: 0;
      height: 0;
      content: '';
      display: inline-block;
      border-top: 12px solid transparent;
      border-right: 12px solid lightgray;
      border-bottom: 12px solid transparent;
      position: absolute;
      left: -12px;
    }

    .div_bar {
      font-size: 12px;
      position: absolute;
      display: block;
      height: 18px;
      top: 3px;
      border-radius: 5px;
      margin: 2px 1px;
    }

    button {
      padding: 0;
    }
  }
`;

const currentDate = moment(new Date()).startOf('day').toDate();

export default function MyBooking(props) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const [reservationList, setReservationList] = useState([]);
  const [reservationData, setReservation] = useState([]);
  const [idToDel, setIdToDel] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  function loadData() {
    console.log('load booking');

    const params = {
      id: props.username,
    };
    const loadRequest = async () => {
      try {
        const response = await axios.get(GET_URL, { params: params }, { withCredentials: true });
        const rslt = response.data?.rslt.map((val) => {
          if (typeof val.startdate === 'string') {
            val.startDate = new Date(val.startdate);
          }
          if (typeof val.enddate === 'string') {
            val.endDate = new Date(val.enddate);
          }
          val.mmtS = moment(val.startDate);
          val.startHour = parseFloat(val.mmtS.format('HH')) + parseFloat(val.mmtS.format('mm') / 60);
          val.startDay = parseInt(val.mmtS.format('D'));
          val.startMonth = parseInt(val.mmtS.format('M'));
          val.startYear = parseInt(val.mmtS.format('YYYY'));
          val.weekday = val.mmtS.format('ddd');

          val.mmtE = moment(val.endDate);
          val.endHour = parseInt(val.mmtE.format('HH')) + parseFloat(val.mmtE.format('mm') / 60);
          val.endDay = parseInt(val.mmtE.format('D'));
          val.endMonth = parseInt(val.mmtE.format('M'));
          val.endYear = parseInt(val.mmtE.format('YYYY'));
          val.weekday = val.mmtS.format('ddd');
          return val;
        });

        const finalMap = [];
        rslt.forEach((item) => {
          let monthYearItem = finalMap.find(
            (item2) => item2.year === item.startYear && item2.month === item.startMonth
          );
          if (!monthYearItem) {
            if (item.startDay === item.endDay) {
              monthYearItem = {
                year: item.startYear,
                month: item.startMonth,
                days: [
                  {
                    day: item.startDay,
                    dayBook: [{ id: item.id, seatId: item.seatid, from: item.startHour, to: item.endHour }],
                  },
                ],
              };
              finalMap.push(monthYearItem);
            } else {
              addMultiDays(item, finalMap);
            }
          } else {
            const dayItem = monthYearItem.days.find((item3) => item3.day === item.startDay);
            if (!dayItem) {
              if (item.startDay === item.endDay) {
                monthYearItem.days.push({
                  day: item.startDay,
                  dayBook: [{ id: item.id, seatId: item.seatid, from: item.startHour, to: item.endHour }],
                });
              } else {
                addMultiDays(item, finalMap);
              }
            } else {
              dayItem.dayBook.push({
                id: item.id,
                seatId: item.seatid,
                from: item.startHour,
                to: item.endHour,
              });
            }
          }
        });
        console.log('modify rslt', rslt);
        console.log('finalMap', finalMap);
        setReservation(finalMap);
        setReservationList(rslt);
      } catch (err) {
        console.log('ERROR loadData', err);
      }
    };
    loadRequest();
  }

  function addMultiDays(item, finalMap) {
    const currDate = item.mmtS.startOf('day');
    const lastDate = item.mmtE.startOf('day');
    let startHour = null;
    while (currDate.diff(lastDate) <= 0) {
      const day = parseInt(currDate.format('D'));
      const weekday = currDate.format('ddd');
      const month = parseInt(currDate.format('M'));
      const year = parseInt(currDate.format('YYYY'));
      startHour = startHour === null ? item.startHour : 0;
      const endHour = currDate.isSame(lastDate) ? item.endHour : 24;

      let monthYearItem = finalMap.find((item2) => item2.year === year && item2.month === month);
      if (!monthYearItem) {
        monthYearItem = {
          year: year,
          month: month,
          days: [
            {
              day,
              weekday,
              dayBook: [{ id: item.id, seatId: item.seatid, from: startHour, to: endHour }],
            },
          ],
        };
        finalMap.push(monthYearItem);
      } else {
        const dayItem = monthYearItem.days.find((item3) => item3.day === day);
        if (!dayItem) {
          monthYearItem.days.push({
            day,
            weekday,
            dayBook: [{ id: item.id, seatId: item.seatid, from: startHour, to: endHour }],
          });
        } else {
          dayItem.dayBook.push({
            id: item.id,
            seatId: item.seatid,
            from: startHour,
            to: endHour,
          });
        }
      }
      currDate.add(1, 'days');
    }
  }

  useEffect(() => {
    console.log('==============> user effect', props.loadBooking);
    loadData();
  }, [props.loadBooking]);

  const barEl = (dayBook, dayMonthKey) => {
    return dayBook.map((val) => {
      const colorId4SeatId = val.seatId % 4;
      const widthBar = (val.to - val.from) / 24 * CONTENT_WIDTH;
      const left = val.from / 24 * CONTENT_WIDTH;
      const style = { width: `${widthBar}px`, left: `${left}px`, backgroundColor: COLORS[colorId4SeatId] };
      const fTDayMonthKey = `${val.from}_${val.to}_${dayMonthKey}`;
      const r = reservationList.find((r) => r.id === val.id);
      return (
        <div className='div_bar' key={fTDayMonthKey} style={style}>
          {`from ${val.from.toFixed(2)} to ${val.to.toFixed(2)}, desk id: ${val.seatId}`}
        </div>
      );
    });
  };

  const tdEl = (item, dayMonthKey) => {
    return item.days.map((day) => {
      return (
        <tr key={day.day} className={moment().isSame(currentDate, 'day') ? 'today' : ''}>
          <td>{day.day + ' ' + day.weekday}</td>
          <td>{barEl(day.dayBook, dayMonthKey)}</td>
          <td>
            <Button className='btn' onClick={() => handleDelete(day.dayBook, day.day)}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </td>
        </tr>
      );
    });
  };

  const handleDelete = (dayBook, day) => {
    setShowAlert(true);
    setIdToDel(dayBook);
  };

  const cancelAlert = () => {
    setShowAlert(false);
    setIdToDel(null);
  };

  const del = async () => {
    setShowAlert(false);
    const ids = idToDel.map((val) => val.id);
    const params = {
      ids,
    };
    try {
      await axios.post(SERVER_URL + 'api/cancel', params, { withCredentials: true });
      props.loadBooking(Math.random());
    } catch (err) {
      console.log('Error cancelling booking', err);
    }
    setIdToDel(null);
  };

  return (
    <>
      <GlobalStyle />
      <MainWrapper>
        <ElementStyle>
          {reservationData.map((item) => {
            const dayMonthKey = `${item.month}_${item.year}`;
            return (
              <div key={dayMonthKey}>
                <div className='wrapper_month'>
                  {moment().month(item.month - 1).format('MMMM') + ' ' + item.year}
                </div>
                <Table bordered>
                  <tbody>{tdEl(item, dayMonthKey)}</tbody>
                </Table>
              </div>
            );
          })}
          <BModal show={showAlert} onHide={cancelAlert}>
            <BModal.Header closeButton>
              <BModal.Title>Confirm Deletion</BModal.Title>
            </BModal.Header>
            <BModal.Body>Are you sure you want to cancel the booking?</BModal.Body>
            <BModal.Footer>
              <Button variant='secondary' onClick={cancelAlert}>
                No
              </Button>
              <Button variant='primary' onClick={del}>
                Yes
              </Button>
            </BModal.Footer>
          </BModal>
        </ElementStyle>
      </MainWrapper>
    </>
  );
}
