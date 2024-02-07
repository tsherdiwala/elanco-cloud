'use client';

import { allMonths, getMonth } from "@/core/utils/date-util";
import NetworkState, { Factory } from "@/core/utils/resource";
import { v4 as uuidv4 } from 'uuid';
import { BarChart } from "@mui/x-charts";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ReactNode, useEffect, useState } from "react";
import api from '../../../core/network/api';

export default function Detail({ params }: { params: { app: string } }) {
  const appName = params.app;

  const [applicationState, setApplicationState] = useState<NetworkState<ApplicationDetailEntity>>(Factory.createLoading);

  useEffect(() => {
    api
    .getApplicationDetail<any[]>(appName)
    .then((data) =>  {
      console.log("===data===", data);
      const updatedData = data.map(d => {
        let date = new Date();

        const [dateOfMonth, month, year] = d.Date.split("/")
        date.setDate(parseInt(dateOfMonth))
        date.setMonth(parseInt(month) - 1)
        date.setFullYear(parseInt(year));

        return {
          id : uuidv4(),
          timestamp: date.valueOf(),
          quantityConsumed: parseInt(d.ConsumedQuantity),
          serviceName: d.ServiceName
      }
      });
      return Factory.createSuccess({name: appName, data: updatedData});
    })
    .catch( () => {
      return Factory.createError(0);
    })
    .then((data) => {
      setApplicationState(data);
    })
  }, []);

  const getContent = (): ReactNode => {
    switch (applicationState.state) {
      case 'loading':
        return (<div>
          <h4>Loading...</h4>
        </div>);
      case 'failed':
        return (<div><h4>Could not load application list. Error Code: {applicationState.code}</h4></div>);
      case 'success':
        return LoadedContent({ applicationDetail: applicationState.response });

    }
  }

  return (
    <div>
      {getContent()}
    </div>
  );
}


interface LoadedContentProps {
  applicationDetail: any
}

const LoadedContent: React.FC<LoadedContentProps> = ({ applicationDetail }: LoadedContentProps) => {

  return <div>
    <p>Consumed month-wise resource consumption for {applicationDetail.name}</p>
    <div>
      <ApplicationUsageGraph applicationDetail={applicationDetail} />
    </div>



    <div>
      <ApplicationUsageTable applicationDetail={applicationDetail} />
    </div>
  </div>;
}

interface ApplicationUsageGraphProps {
  applicationDetail: any
}


const ApplicationUsageGraph: React.FC<ApplicationUsageGraphProps> = (props: any) => {
  console.log("application usage graph", props);

  //const sortedData = [...applicationDetail.data].sort((a, b) => a.timestamp - b.timestamp);
  const sortedData: any[] = [];

  const axisData: string[] = allMonths;

  const dataObject: { [key: string]: number[] } = {};


  for (let index = 0; index < sortedData.length; index++) {
    const data = sortedData[index];

    const monthIndex = (new Date(data.timestamp)).getMonth();

    let previousValue: number = 0;
    try {
      previousValue = dataObject[data.serviceName][monthIndex];
    } catch (e) {
      // do nothing
    }

    if (!dataObject[data.serviceName]) {
      dataObject[data.serviceName] = [];
    }

    dataObject[data.serviceName][monthIndex] = previousValue + data.quantityConsumed;
  }

  const fillEmptyMonthEntries = (data: number[]): number[] => {
    const updatedEntries = [];

    for (let index = 0; index < allMonths.length; index++) {
      updatedEntries[index] = data[index] ?? 0;

    }

    return updatedEntries;
  }

  const seriesData = Object.keys(dataObject).map(key => {
    return {
      data: fillEmptyMonthEntries(dataObject[key]),
      label: key
    }
  })

  return <BarChart
    legend={{ hidden: true }}
    sx={{ marginLeft: 'auto', marginRight: 'auto' }}
    xAxis={[{ scaleType: 'band', data: allMonths }]}
    series={seriesData}
    height={300}
  />;

}

interface ApplicationUsageTableProps {
  applicationDetail: any
}

const ApplicationUsageTable: React.FC<ApplicationUsageTableProps> = ({ applicationDetail }: ApplicationUsageTableProps) => {

  const sortedData = [...applicationDetail.data].sort((a, b) => a.timestamp - b.timestamp);

  const formatDate = (date: Date): string => {
    return `${date.getDate()}-${getMonth(date)}-${date.getFullYear()}`;
  }

  const columns: GridColDef[] = [
    {
      field: 'timestamp',
      headerName: 'Date',
      editable: false,
      valueFormatter: (value) => {
        return formatDate(new Date(value.value))
      }
    },
    {
      field: 'serviceName',
      headerName: 'Service Name',
      editable: false,
      flex: 1,
    },
    {
      field: 'quantityConsumed',
      headerName: 'Quantity Consumed',
      editable: false,
      width: 200
    }
  ];

  const rows = sortedData;



  return (
    <div>
      <h2>Detailed logs for utilization:</h2>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        getRowId={(row: any) => row.id}
        rowSelection={false}
      />
    </div>
  )
}


export interface ApplicationDetailDataEntity {
  id: string,
  timestamp: number,
  serviceName: string,
  quantityConsumed: number,
}

export interface ApplicationDetailEntity {
  name: string,
  data: ApplicationDetailDataEntity[]
}
