import * as React from "react";

const styles = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #eee",
    borderRadius: 3,
    cursor: "pointer",
    fontSize: 15,
    margin: 10,
    padding: "3px 10px",
};

interface IOwnProps {
    children?:React.ReactNode;
    onClick?:(e:any) => void;
}

const StorybookExampleButton:React.SFC<IOwnProps> = (props) => (
    <button onClick={props.onClick} style={styles} type="button">
        {props.children}
    </button>
);

export { StorybookExampleButton };
