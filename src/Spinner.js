import React from 'react'
import { Loader, Dimmer } from 'semantic-ui-react'

const Spinner = () => (
  <Dimmer active class="hello">
    <Loader size="huge">Loading</Loader>
  </Dimmer>
)

export default Spinner
