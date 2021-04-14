import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import Ripple from '../../../components/page/Loading';
import './index.css';

interface State {
    loading: boolean;
}

interface Props {
    endpoint: string;
    module: string;
}

const defaultProps: Props = {
    endpoint: '',
    module: '',
};
export type AnalysisPropTypes = Props & WithTranslation;
export class Analysis extends React.Component<AnalysisPropTypes, State> {
    public static defaultProps = defaultProps;

    constructor(props: AnalysisPropTypes) {
        super(props);
        this.state = {
            loading: true,
        };
    }

    public render() {
        const { t } = this.props;
        return (
            <div className="analysis">
                <div>
                    <h2 className="analysis-title">{t(`${this.props.module} - Analysis`)}</h2>
                </div>
                <div className="analysis-wrapper">
                    {this.state.loading ? <Ripple /> : null}
                    <iframe
                        seamless
                        scrolling="yes"
                        frameBorder="0"
                        onLoad={this.hideSpinner}
                        src={this.props.endpoint}
                        title="pregnancy sms events analysis"
                        className="analysis-iframe"
                    />
                </div>
            </div>
        );
    }

    private hideSpinner = () => {
        this.setState({
            loading: false,
        });
    };
}

export default withTranslation()(Analysis);
