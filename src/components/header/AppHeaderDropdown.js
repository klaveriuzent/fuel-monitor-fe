import { CAvatar, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'

import avatar0 from './../../assets/images/avatars/0.jpg'

const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item" className="ms-3">
      <CDropdownToggle
        className="d-flex align-items-center border-0 bg-transparent p-0"
        caret={false}
      >
        <CAvatar src={avatar0} size="md" />
      </CDropdownToggle>
      <CDropdownMenu placement="bottom-end">
        <CDropdownItem href="#">Log Out</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
