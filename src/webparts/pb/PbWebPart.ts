import * as React from 'react';
import * as ReactDom from 'react-dom';

import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';


import Pb from './components/Pb';
import { IPbProps } from './components/IPbProps';

export interface IPbWebPartProps {
  description: string;
}

export default class PbWebPart extends BaseClientSideWebPart<IPbWebPartProps> {


  public render(): void {
    const element: React.ReactElement<IPbProps> = React.createElement(
      Pb,
      {
        description: this.properties.description,
        context: this.context, 
      }
    );

    ReactDom.render(element, this.domElement);
  }


}