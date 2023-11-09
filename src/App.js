import React from "react";
import styled from "styled-components";
import { useTable } from "react-table";
import "./style.scss";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// import makeData from "./makeData";

const trStyle = {
  backgroundColor: "red",
  display: (isDragging) => (isDragging ? "table" : "")
};
const Styles = styled.div`
  padding: 1rem;
`;

function Table({
  columns,
  data,
  updateMyData,
  removeRow,
  addRow,
  resetData,
  reorderData
}) {
  const table = useTable({
    columns,
    data,
    // non-API instance pass-throughs
    updateMyData,
    removeRow,
    addRow,
    reorderData
  });
  // console.log({ table });
  const { getTableProps, headerGroups, prepareRow, rows } = table;

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    reorderData(source.index, destination.index);
  };
  console.log(headerGroups, "headerGroup");
  return (
    <>
      <table {...getTableProps()} className="table">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render("Header")}</th>
              ))}
            </tr>
          ))}
        </thead>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="table-body">
            {(provided, snapshot) => (
              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                    <Draggable
                      draggableId={row.original.id}
                      key={row.original.id}
                      index={row.index}
                    >
                      {(provided, snapshot) => {
                        return (
                          <tr
                            style={trStyle}
                            {...row.getRowProps()}
                            {...provided.draggableProps}
                            // {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            isDragging={snapshot.isDragging}
                          >
                            {row.cells.map((cell) => (
                              <td {...cell.getCellProps()}>
                                {cell.render("Cell", {
                                  dragHandleProps: provided.dragHandleProps,
                                  isSomethingDragging: snapshot.isDraggingOver
                                })}
                              </td>
                            ))}
                          </tr>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
                <tr
                  style={{
                    backgroundColor: "white"
                  }}
                >
                  <td
                    style={{ backgroundColor: "darkblue" }}
                    colSpan={columns.length}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        textAlign: "center"
                      }}
                    >
                      <span
                        className={"reset-data-button"}
                        onClick={() => resetData()}
                        role="img"
                        aria-label="reset"
                      >
                        Reset Items 🔁
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            )}
          </Droppable>
        </DragDropContext>
      </table>
      <pre>
        {JSON.stringify(
          rows.map((row) => row.values),
          null,
          2
        )}
      </pre>
    </>
  );
}

function App() {
  const columns = React.useMemo(() => {
    const DescriptionCell = (props) => {
      return (
        <div className="description">
          <span
            {...props.dragHandleProps}
            className={"up-down-arrow-icon"}
            aria-label="move"
            role="img"
          >
            ↕️
          </span>
        </div>
      );
    };

    const SumCell = (props) => {
      console.log(props?.removeRow, "HeyProps");
      return (
        <>
          <div className="sum">
            <span
              className={"trash-can-icon"}
              onClick={() => props.removeRow(props?.row.index)}
              role="img"
              aria-label="delete"
              {...props}
            >
              🗑️
            </span>
            {/* <StyledTrashCan /> */}
            {props.row.values.sum}
          </div>
        </>
      );
    };
    return [
      {
        Header: "Description",
        accessor: "description",
        Cell: DescriptionCell
      },
      {
        Header: "One",
        accessor: "one"
        // Cell: EditableNumberCell
      },
      {
        Header: "Two",
        accessor: "two"
        // Cell: EditableNumberCell
      },
      {
        Header: "Sum",
        accessor: (row) => row.one + row.two,
        id: "sum",
        Cell: SumCell
      }
    ];
  }, []);

  const staticData = [
    { id: "item-1", description: "First thing", one: 0, two: 5, sum: 0 },
    { id: "item-2", description: "Second thing", one: 7, two: 1, sum: 0 },
    { id: "item-3", description: "Third thing", one: 2, two: 4, sum: 0 }
  ];

  // const [data, setData] = React.useState(() => makeData(3));
  // const [originalData] = React.useState(data);
  const [data, setData] = React.useState(staticData);
  const [idCount, setIdCount] = React.useState(staticData.length + 1);

  const resetData = () => setData(staticData);
  const removeRow = (rowIndex) => {
    setData((old) => old.filter((row, index) => index !== rowIndex));
  };
  const addRow = () => {
    const one = Math.floor(Math.random() * 10);
    const two = Math.floor(Math.random() * 10);
    const sum = one + two;
    setData((old) => [
      ...old,
      {
        id: `item-${idCount}`,
        description: `Thing ${idCount}`,
        one,
        two,
        sum
      }
    ]);
    setIdCount(idCount + 1);
  };
  const updateMyData = (rowIndex, columnID, newValue) => {
    setData((oldData) =>
      oldData.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...oldData[rowIndex],
            [columnID]: newValue
          };
        }
        return row;
      })
    );
  };
  const reorderData = (startIndex, endIndex) => {
    const newData = [...data];
    const [movedRow] = newData.splice(startIndex, 1);
    newData.splice(endIndex, 0, movedRow);
    setData(newData);
  };

  return (
    <Styles>
      <Table
        columns={columns}
        data={data}
        updateMyData={updateMyData}
        removeRow={removeRow}
        addRow={addRow}
        resetData={resetData}
        reorderData={reorderData}
      />
    </Styles>
  );
}

export default App;
