import { storiesOf } from "@storybook/react"; // tslint:disable-line
import * as React from "react";
import { StorybookExampleButton } from ".";
storiesOf("StorybookExampleButton", module)
    .add("with text", () => (
        <StorybookExampleButton>Hello Button</StorybookExampleButton>
    ))
    .add("with some emoji", () => (
        <StorybookExampleButton>😀 😎 👍 💯</StorybookExampleButton>
    ));
