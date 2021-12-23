import React from 'react';
import Icon from './Icon';
import {
  Form,
  Button,
  InputGroup,
  FormControl,
  ButtonGroup,
} from 'react-bootstrap';
import { FaListUl, FaPlayCircle } from 'react-icons/fa';
import { BsArrowsFullscreen } from 'react-icons/bs';
import { isBrowser, isMobile } from 'react-device-detect';

const Aside = ({ keyword, toggle, channel, setShow, setChannel }) => {
  const handleShow = () => setShow(true);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isBrowser) {
      setChannel({
        ...channel,
        url: `https://cors-unlimited.herokuapp.com/${keyword}`,
        keyword: '',
      });
    }
    if (isMobile) {
      setChannel({
        ...channel,
        keyword: '',
      });
      window.open(keyword, '_blank');
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setChannel({ ...channel, [name]: value });
  };
  const handleToggle = () => {
    setChannel({ ...channel, toggle: !toggle });
  };
  return (
    <aside>
      {!toggle && (
        <Form className='d-flex justify-content-end' onSubmit={handleSubmit}>
          <InputGroup className='input'>
            <FormControl
              type='url'
              id='url-input'
              name='keyword'
              value={keyword}
              onChange={handleChange}
              placeholder='Enter M3U8 URL'
            />
            <InputGroup.Append>
              <ButtonGroup>
                <Button
                  id='url-submit'
                  className='rounded-0'
                  variant='outline-light'
                  onClick={handleShow}
                >
                  <Icon>
                    <FaListUl />
                  </Icon>
                </Button>
                <Button type='submit' variant='outline-light'>
                  <Icon>
                    <FaPlayCircle />
                  </Icon>
                </Button>
              </ButtonGroup>
            </InputGroup.Append>
          </InputGroup>
        </Form>
      )}
      <Button
        className='ml-3 menu'
        variant='outline-light'
        onClick={handleToggle}
      >
        <Icon>
          <BsArrowsFullscreen />
        </Icon>
      </Button>
    </aside>
  );
};

export default Aside;
