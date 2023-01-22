import { ButtplugClientDevice, GenericDeviceMessageAttributes, MessageAttributes } from "buttplug";
import Slider from "rc-slider";
import { FC, useState } from "react";
import styles from 'styles/Slider.module.css';
import 'rc-slider/assets/index.css';
import { PeerDevice } from "modules/multiplayer/peer/device";

interface BasicControllerProps {
    device: ButtplugClientDevice | PeerDevice
}

const BasicController: FC<BasicControllerProps> = ({device: d}) => {
    const vibrate_attributes = d.vibrateAttributes;
    const [vibrateStates, setVibrateStates] = useState<number[]>(Array(Number(vibrate_attributes?.length)).fill(0));

    let rotate_attributes: GenericDeviceMessageAttributes[] | undefined = undefined;
    try {
        rotate_attributes = d.messageAttributes.RotateCmd;
    }
    catch {}
    
    return (
        <>  
            {vibrateStates.length !== 0 && <h2>Vibrate</h2>}
            { 
                vibrateStates.map((e, i) => (
                    <div className="pb-2" key={i}>
                        <Slider 
                            value={e * 100} 
                            step={100 / (vibrate_attributes?.at(i)?.StepCount ?? 10)}
                            onChange={(v) => {
                                const new_vib_states = [...vibrateStates];
                                new_vib_states[i] = v as number / 100;
                                d.vibrate(new_vib_states);
                                setVibrateStates(new_vib_states);
                            }} 
                            className={styles.slider} 
                        />
                    </div>
                ))
            }
            { rotate_attributes?.length !== 0 }
            {
                Array(rotate_attributes?.length).map((_e, i) => {
                    <div className="pb-2" key={i}>
                        <Slider 
                            defaultValue={50} 
                            step={100 / (rotate_attributes?.at(i)?.StepCount ?? 10)}
                            onChange={(v) => {
                                const move_value = (Number(v) - 50) / 100;
                                const clockwise = move_value < 0 ? false : true;
                                d.rotate([[move_value, clockwise]], clockwise)
                            }} 
                            className={styles.slider} 
                        />
                    </div>
                })
            }
        </>
    )
}

export default BasicController;