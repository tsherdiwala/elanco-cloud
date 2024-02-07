'use client';

import { ReactNode, useEffect, useState } from "react";
import NetworkState, { Factory } from "../core/utils/resource";
import api from '../core/network/api';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/navigation";

export default function Home() {
  const [applicationState, setApplicationState] = useState<NetworkState<string[]>>(Factory.createLoading);

  const router = useRouter();

  useEffect(
    () => {

      api.getApplications<string[]>()
        .then((data) => {
          return Factory.createSuccess(data)
        })
        .catch((error) => {
          return Factory.createError(0);
        })
        .then((result: NetworkState<string[]>) => {
          setApplicationState(result);
        });
    },
    []
  );

  const getContent = (): ReactNode => {
    switch (applicationState.state) {
      case 'loading':
        return (<div><h4>Loading...</h4></div>);
      case 'failed':
        return (<div><h4>Could not load application list. Error Code: {applicationState.code}</h4></div>);
      case 'success':
        return LoadedList({
          applications: applicationState.response,
          onSelect(application: string) {
            router.push(`/detail/${application}`);
          },
        });

    }
  }

  return (
    <main className="flex min-h-screen flex-col p-6">
      <h1>Choose the list of application below to view details</h1>
      <div>
        {getContent()}
      </div>
    </main>
  );
}

interface LoadedListProps {
  applications: string[],
  onSelect: (application: string) => void
}

const LoadedList: React.FC<LoadedListProps> = ({ applications, onSelect }: LoadedListProps) => {

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Application Name',
      editable: false,
      flex: 1,
    }
  ];

  const rows = applications.map(name => {
    return { name };
  });

  return <DataGrid
    rows={rows}
    columns={columns}
    initialState={{
      pagination: {
        paginationModel: {
          pageSize: 10,
        },
      },
    }}
    getRowId={(row) => row.name}
    rowSelection={false}
    onRowClick={(row) => {
      onSelect(row.row.name);
    }}
  />
}