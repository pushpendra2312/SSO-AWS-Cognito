import React, { useEffect, useState } from 'react';
import { Amplify, Auth } from "aws-amplify";
import { AMPLIFY_CONFIG } from '../configs/aws-exports';

import { Button } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';

import { FormControl } from 'react-bootstrap';
Amplify.configure(AMPLIFY_CONFIG);

const NOTSIGNIN = 'NOT Logged In';
const SIGNEDIN = 'Logged in successfully';
const SIGNEDOUT = 'Logged out successfully';
const WAITINGFOROTP = 'Enter OTP number';
const VERIFYNUMBER = 'Verifying number';

const AWSCognito = () => {

    const [message, setMessage] = useState('Welcome to Demo');
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [otp, setOtp] = useState('');
    const [number, setNumber] = useState('');
    const password = Math.random().toString(10) + 'Abc#';

    console.log("Logged In User Data", user)

    useEffect(() => {
        verifyAuth();
    }, []);

    const verifyAuth = () => {
        Auth.currentAuthenticatedUser({ bypassCache: true })
            .then((user) => {
                console.log('currentAuthenticatedUser()', user)
                setUser(user);
                setMessage(SIGNEDIN);
                setSession(null);
            })
            .catch((err) => {
                console.error(err);
                setMessage(NOTSIGNIN);
            });
    };
    const signOut = () => {
        if (user) {
            Auth.signOut();
            setUser(null);
            setOtp('');
            setMessage(SIGNEDOUT);
        } else {
            setMessage(NOTSIGNIN);
        }
    };
    const signIn = () => {
        setMessage(VERIFYNUMBER);
        Auth.signIn(`+91${number}`)
            .then((result) => {
                console.log('signIn()', result)
                setSession(result);
                setMessage(WAITINGFOROTP);
            })
            .catch((e) => {
                console.log('inside', e)
                if (e.code === 'UserNotFoundException') {
                    signUp();
                } else if (e.code === 'UsernameExistsException') {
                    setMessage(WAITINGFOROTP);
                    signIn();
                } else {
                    console.log("inside UsernameExistsException", e.code);
                    console.error(e);
                }
            });
    };
    const signUp = async () => {
        const result = await Auth.signUp({
            username: number,
            password,
            attributes: {
                phone_number: number,
                // name: 'Test',
                // email: 'pushpendra.gupta@travclan.com'
            },
        }).then(() => signIn());
        return result;
    };
    const verifyOtp = () => {
        Auth.sendCustomChallengeAnswer(session, otp)
            .then((user) => {
                if (user.signInUserSession) {
                    console.log("sendCustomChallengeAnswer", user.signInUserSession)
                } else {
                    throw ("user.signInUserSession 123")
                }
                setUser(user);
                setMessage(SIGNEDIN);
                setSession(null);
            })
            .catch((err) => {
                setMessage(err.message);
                setOtp('');
                console.log(err);
            });
    };

    return (
        <div>
            <p>{message}</p>
            {!user && !session && (
                <div>
                    <InputGroup>
                        <FormControl
                            placeholder='Phone Number'
                            style={{ fontSize: "25px" }}
                            onChange={(event) => setNumber(event.target.value)}
                        />
                    </InputGroup>
                    <Button variant='outline-secondary'
                        style={{ fontSize: "25px", marginTop: "30px" }}
                        onClick={signIn}>
                        Get OTP
                    </Button>
                </div>
            )}
            {!user && session && (
                <div>
                    <InputGroup className='mb-3'>
                        <FormControl
                            style={{ fontSize: "25px" }}
                            placeholder='Your OTP'
                            onChange={(event) => setOtp(event.target.value)}
                            value={otp}
                        />
                    </InputGroup>
                    <Button variant='outline-secondary'
                        style={{ fontSize: "25px", marginTop: "30px" }}
                        onClick={verifyOtp}>
                        Confirm
                    </Button>
                </div>
            )}
            <div>
                <ButtonGroup style={{ marginTop: "30px" }}>
                    <Button style={{ fontSize: "25px", marginRight: "25px" }} variant='outline-primary' onClick={verifyAuth}>
                        Am I sign in?
                    </Button>
                    <Button style={{ fontSize: "25px" }} variant='outline-danger' onClick={signOut}>
                        Sign Out
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}

export default AWSCognito