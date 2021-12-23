import React from 'react';
import Listing from './Listing';
import Icon from './Icon';
import { FaPlus } from 'react-icons/fa';
import { Card, Accordion, Badge } from 'react-bootstrap';

const CollapseBox = ({ urls, channel, setChannel }) => {
  return (
    <Accordion className='rounded-0'>
      {urls.map((i, idx) => {
        return (
          <Card key={idx} className='rounded-0 border-0 shadow-lg'>
            <Accordion.Toggle
              className='bg-dark'
              variant='dark'
              as={Card.Header}
              eventKey={idx}
            >
              {i.length !== 0 ? (
                <div className='d-flex justify-content-between align-items-center'>
                  <span>
                    {i[0].country}{' '}
                    <Badge variant='light' className='ml-2'>
                      {i.length}
                    </Badge>
                  </span>
                  <Icon>
                    <FaPlus />
                  </Icon>
                </div>
              ) : (
                'Undefined'
              )}
            </Accordion.Toggle>
            <Accordion.Collapse eventKey={idx}>
              <Card.Body className='bg-dark p-0'>
                <Listing item={i} channel={channel} setChannel={setChannel} />
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        );
      })}
    </Accordion>
  );
};

export default CollapseBox;
