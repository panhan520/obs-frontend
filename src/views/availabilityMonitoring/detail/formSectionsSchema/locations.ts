import { storeToRefs } from 'pinia'
import useAvailabilityMasterData from '~/store/modules/useAvailabilityMasterData'
import { getCollapseTitle } from './commonFields'

import type { ISchema } from "@formily/vue"
import type { IGetSchemaParams } from '../interfaces'

const getSchema = ({ isView }: IGetSchemaParams): ISchema => {
  const { masterData } = storeToRefs(useAvailabilityMasterData())
  return {
    type: 'void',
    'x-component': 'FormCollapse.Item',
    'x-component-props': {
      title: getCollapseTitle({ index: 4, title: '任务监测节点' }),
    },
    properties: {
      locations: {
        type: 'array',
        'x-component': 'Locations',
        enum: masterData.value.locations,
      }
    },
  }
}

export default getSchema
