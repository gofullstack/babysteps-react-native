import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { CheckBox } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

import { connect } from 'react-redux';

import Colors from '../constants/Colors';

// eslint-disable-next-line react/prefer-stateless-function
class ConsentDisclosureContent002 extends Component {

  render() {
    const {
      screening_blood,
      screening_blood_notification,
      screening_blood_other,
      video_presentation,
      video_sharing,
      errorMessage,
      formState,
    } = this.props;

    return (
      <View>
        <View style={styles.elevated}>
          <Ionicons
            name="md-phone-portrait"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>
            Epigenetics, polygenic risk and the social environment in autism
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Principal Investigator:</Text>{'\n'}
            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>Lane Strathearn MD PhD (lane-strathearn@uiowa.edu)</Text>
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>Research Team Contacts:</Text>
            {'\n'}
            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              Lane Strathearn MD PhD (319 356 7044)
            </Text>
          </Text>
          <Text style={styles.text}>
            This consent form describes the research study to help you decide if
            you want you and your child to participate. This form provides
            important information about what you and your child will be asked to
            do during the study, about the risks and benefits of the study, and
            about your and your child's rights as research subjects. 
          </Text>
          <Text style={styles.text}>
            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              If you have any questions about or do not understand something in
              this form, you should ask the research team for more information.
            </Text>
            {'\n'}
            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              You should discuss your participation with anyone you choose such
              as family or friends.
            </Text>
            {'\n'}
            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              Do not agree to participate in this study unless the research team
              has answered your questions and you decide that you and your child
              want to be part of this study.
            </Text>
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-construct"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>What is the Purpose of this Study?</Text>
          <Text style={styles.text}>
            This is a research study. We are inviting you and your child to
            participate, because your child, who may or may not have behavioral
            or developmental challenges, is 14 months to 3 years old. In this
            study, both you and your child will be considered research
            participants.
          </Text>
          <Text style={styles.text}>
            The purpose of this research is to better understand how genetics
            and the social environment influence the way children develop.
            Specifically, this study will use a smartphone application and blood
            samples to study potential risk factors for Autism Spectrum Disorder
            or other developmental disorders.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-people"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>How Many People Will Participate?</Text>
          <Text style={styles.text}>
            Approximately 320 mothers and their children will take part in this
            study conducted by investigators at the University of Iowa.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-clock"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />
          <Text style={styles.header}>How Long Will I Be in this Study?</Text>
          <Text style={styles.text}>
            If you agree to take part in this study, your/your child's
            involvement will last for about 6 months. This may include one or
            two 15-minute in-person visit(s) to the Center for Disabilities and
            Development (CDD), and your continued use of the smartphone app,
            'BabySteps' from your home. Completing a prompt or task from the app
            should only take a few seconds or minutes of your time on each
            occasion.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-clipboard"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>What Will Happen During this Study?</Text>
          <Text style={styles.text}>
            Researchers will determine your eligibility and will provide you with
            a link to access the BabySteps smartphone application. After you have
            reviewed the BabySteps app, you can press the "Agree" button on the
            application to formally consent to the study, and can sign
            electronically. You and your child cannot participate in this study
            without giving your signed permission. Once the consent form is
            properly completed, you/your child may complete other app-based tasks
            and in-person procedures.
          </Text>
          <Text style={styles.text}>
            During this study, each mother-child pair may meet with researchers
            once or twice. If your child has an appointment scheduled at the CDD
            or another University of Iowa clinic, study researchers may meet
            with you shortly before or after this appointment. A blood draw may
            be part of these appointments, and researchers may request access to
            a small amount of the blood that is drawn at that time. If your child
            is not scheduled for a clinical evaluation or was scheduled for
            evaluation but did not have blood drawn at that time, researchers will
            contact you to explain the procedures for a blood sample collection
            for your child. This sample can be collected at the CDD or the
            University of Iowa by trained staff or by you in your home. At the
            time of the blood sample collection, you will also fill out a brief
            questionnaire about your chid's current health status. The collected 
            sample will be compared to a sample of blood that was taken when
            your child was born (these samples are obtained from all babies born
            in the state of Iowa). Analyzing the two samples will reveal whether
            chemical ("epigenetic") changes occurred over time.
          </Text>
          <Text style={styles.text}>
            Researchers will also orient you to the smartphone application,
            BabySteps, that you will be asked to use for about 6 months. Within
            the app, you will be able to take photos and record special
            milestones. Occasionally, you will be asked to videotape yourself
            playing with your child. In these videos, you will also be asked 
            to briefly "frustrate" your child. This might be simply achieved,
            for example, by taking away your child's toy. 
           </Text>
          <Text style={styles.text}>            
            You will also complete screening tests or
            questions designed to assess your child's behavior and language, motor,
            and cognitive development. Some of these screening tests will assess for
            early signs of autism. Certain results may indicate your child is
            not eligible to continue in this study. If this occurs, you will be
            notified. You are free to continue use of the app if you so choose.
          </Text>
          <Text style={styles.text}>
            We may ask other questions about your mood, your day-to-day life, or
            your history. You are free to skip any questions that you would
            prefer not to answer. Prompts will also appear on your cell phone several
            times per week and these will usually only require a single button press.
            You should try to answer these as soon as you see them. Other
            questionnaires should take between 1 and 15 minutes to complete on each
            occasion and may be sent to your email via a secure platform. If any of
            the information gathered, such as information about your well-being or
            your child's development, indicates a need for intervention, you may be
            contacted and referred to appropriate providers. During this study, you
            may also be contacted by phone (call or text) or email to pose or answer
            questions, remind you of your study deadlines, or to follow up about
            study progression or incomplete procedures. 
          </Text>
          <Text style={styles.text}>
            You are free to share consent stored in the app to your social media
            accounts. Study researchers and collaborators will only use your
            data and consent for the purposes of this study unless you give
            consent for it to be shared with other researchers. If your child
            was assessed in the CDD, we will also obtain information from your
            child's medical record about the results of the evaluation by the
            doctor, psychologist, and/or speech therapist.
          </Text>

          <Text style={styles.subTitle}>
            Data and Blood Storage for Future Use
          </Text>
          <Text style={styles.text}>
            As part of this study, we are obtaining blood samples from your
            child. We and other researchers may wish to study your child’s blood
            samples in the future, after this study is over without further
            consent. These samples, information, and/or data may be placed in a
            central repository or other national repositories sponsored by the
            National Institutes of Health or other Federal agencies. If this
            happens, it may be stripped of identifiers (such as name, date of
            birth, address, etc.). Other qualified researchers who obtain proper
            permission may gain access to your sample and/or data for use in
            approved research studies that may or may not be related to the
            purpose of this study.
          </Text>
          <Text style={styles.text}>
            Blood cells removed from the blood samples may be used to make a
            cell line and DNA or conduct whole genome sequencing. Cell lines are
            produced by growing blood cells in a laboratory and allow us to have
            a source of the DNA without having to redraw your blood. These blood
            cells can be stored for decades or more. The DNA and data might be
            made available to researchers trying to learn more about the cause
            of diseases.
          </Text>
          <Text style={styles.text}>
            Each of the cells in your body contains DNA. DNA is the instruction
            manual that determines your appearance in things like eye color or
            how tall you can be. Your DNA may also lead to higher or lower risk
            of certain diseases. Your environment will also determine some of
            your disease risk.
          </Text>
          <Text style={styles.text}>
            Your DNA is a string of four building blocks, called “bases.” These
            bases are represented by the letters G, A, T, and C. There are
            billions of these letters strung together in every human’s DNA and
            they are arranged in packages like words. Each of these “words” have
            specific jobs in the body. Most of the time the letters are the same
            in everyone. But about 1% of the population might have an “A” where
            someone else has a “G.” This difference can explain why some people
            have blue eyes and others brown eyes, or why some have a high risk
            for a certain cancer and others a low risk. All these letters come
            together to create your “genome sequence”, a kind of book of your
            genetics. It now possible to read off each of these letters and read
            your complete genome sequence. Your DNA sequence is unique to you.
            You inherit your DNA in almost equal parts from each of your
            parents. In very rare cases, your genome can also change through
            “mutations.” A mutation is like if you tried to copy a page from a
            book, but misspelled some words. Mutations usually result from
            copying errors that occur in certain letters when being passed from
            parent to child.
          </Text>
          <Text style={styles.text}>
            When we take a sample of your child’s blood for this study, it might
            go to a lab to read off those letters and give us a report on your
            child’s genome. This information will then be compared with other
            genomes to see how they may be the same or different. It is our hope
            this will help us to better understand how the human body works
            and/or what causes it to not work well, as when someone has a
            developmental delay or condition.
          </Text>
          <Text style={styles.text}>
            The tests we might want to use to study your child’s blood samples
            may not even exist at this time. Therefore, we are asking for your
            permission to store your child’s blood samples so that we can study
            them in the future. These future studies may provide additional
            information that will be helpful in understanding Autism Spectrum
            Disorder, but it is unlikely that what we learn from these studies
            will have a direct benefit to you or your child. It is possible that
            your child’s blood samples might be used to develop products, tests,
            or discoveries that could be patented and licensed. In some
            instances, these may have potential commercial value and may be
            developed by the Investigators, University of Iowa, commercial
            companies, funding organizations, or others that may not be working
            directly with this research team. However, donors of blood samples
            do not retain any property rights to the materials. Therefore, there
            are no plans to provide financial compensation to you should this
            occur.
          </Text>
          <Text style={styles.text}>
            Your child’s blood samples will be stored with a code which may be
            linked to your/your child’s identifying information, such as name or
            date of birth. If you agree now to future use of your child’s blood
            sample but decide in the future that you would like to have it
            removed from future research, you should contact Lane Strathearn MD
            PhD (319-356-7044). However, if some research with your child’s
            blood sample has already been completed, the information from that
            research may still be used.
          </Text>

          <View style={styles.checkboxView}>
            <Text style={styles.header}>
              Please indicate Yes or No for each of the questions below:
            </Text>

            <Text style={styles.text}>
              The tests we might want to use to study your child’s blood samples
              may not even exist at this time. Therefore, we are asking for your
              permission to store your child’s blood samples so that we can
              study them in the future. Please indicate Yes or No below
            </Text>

            <CheckBox
              title="Yes, my child’s blood samples may be stored/shared for future
                gene research in Autism and other developmental disorders."
              textStyle={styles.checkboxText}
              checked={screening_blood === true}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood', true)
              }
            />

            <CheckBox
              title="No, my child’s blood samples may NOT be stored/shared for
                future gene research in Autism and other developmental disorders"
              textStyle={styles.checkboxText}
              checked={screening_blood === false}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood', false)
              }
            />

            <Text style={styles.text}>
              We might want to use your child’s blood samples for other
              research. Therefore, we are asking for your permission to store
              you child’s blood samples so that we might use them in the future.
              Please indicate Yes or No below:
            </Text>

            <CheckBox
              title="Yes, my child’s blood samples may be stored/shared for future
                research for any other purpose."
              textStyle={styles.checkboxText}
              checked={screening_blood_other === true}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood_other', true)
              }
            />

            <CheckBox
              title="No, my child’s blood samples my NOT be stored/shared for future
                research for any other purpose."
              textStyle={styles.checkboxText}
              checked={screening_blood_other === false}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood_other', false)
              }
            />
          </View>

          <Text style={styles.subTitle}>
            Will I Be Notified If My/My Child’s Data/Biospecimens Results In An
            Unexpected Finding?
          </Text>
          <Text style={styles.text}>
            The results from the blood samples we collect in this research study
            are not the same as what you would receive as part of routine health
            care. The results of the blood sample analysis for this study will
            not be reviewed by a physician who normally reads such results,
            unlike the other blood tests ordered by your physician. Due to this,
            you will not be informed of the study blood test findings, although
            you will for the regular blood test ordered by your physician. These
            study results will also not be placed in your child’s medical record
            with their primary care physician or otherwise. If you believe that
            your child is having symptoms that may require care, you should
            contact your primary care physician.
          </Text>
          <Text style={styles.text}>
            We may learn other things about you/your child from the study
            activities which could be important to your/your child’s health or
            treatment. This could include your child screening positive for a
            possible developmental delay, or you screening positive for a
            potential mental health concern. If this occurs, you may be notified
            and referred to appropriate providers. You can decide whether you
            want this information to be provided to you. If you choose to have
            this shared, you will be informed of any unexpected findings of
            possible clinical significance that may be discovered during review
            of results from your/your child’s data. The results from the data we
            collect in this research study are not necessarily the same quality
            as what you would receive as part of your/your child’s routine
            health care. There may be benefits to learning such results (such as
            early detection and treatment of a medical condition), but there are
            risks as well (such as feeling worried until a diagnostic
            appointment can be scheduled).
          </Text>
          <Text style={styles.text}>
            If your child screens positive for a developmental concern, your
            child may be referred for further assessment. Similarly, if you
            indicate on screening forms that you are experiencing high levels of
            anxiety, depression, and/or suicidal thoughts, you will be referred
            to appropriate healthcare providers.
          </Text>
          <View style={styles.checkboxView}>
            <Text style={styles.header}>
              In the event of unexpected findings, data will be reviewed by a
              physician who normally reads such results. We can provide you with
              this information so that you may discuss it with your/your child's
              primary care physician. Please select one of the following
              options:
            </Text>

            <CheckBox
              title="Yes, I want to be provided with this information."
              textStyle={styles.checkboxText}
              checked={screening_blood_notification === true}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood_notification', true)
              }
            />

            <CheckBox
              title="No, I do NOT want to be provided with this information."
              textStyle={styles.checkboxText}
              checked={screening_blood_notification === false}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('screening_blood_notification', false)
              }
            />
          </View>
              </Text>
          <Text style={styles.text}>
            However, if you believe you/your child are having symptoms that may require care prior 
            to receiving any information from this study, you should contact your/your chid's primary 
            care physician. The study team/study will not cover the costs of any follow-up consultations 
            or actions.
          </Text>
          
    <Text style={styles.subTitle}>Genetic Research</Text>
          <Text style={styles.text}>
            Another purpose of this study is to look at genes (DNA) and how they
            affect health and disease. Genes are the instruction manual for the
            body. The genes you get from your parents decide what you look like
            and how your body behaves. They can also tell us a person’s risk for
            certain diseases and how they will respond to treatment. We will
            study your child’s DNA by comparing their blood from two different
            points in time to see if chemical (“epigenetic”) changes have
            occurred. Blood test results will not be shared with you or your
            child’s doctor. No one else (like a relative, boss, or insurance
            company) will be given access to these test results.
          </Text>
          <Text style={styles.text}>
            Additionally, with your consent, your child’s newborn blood spot may
            be obtained from the Iowa Department of Public Health and analyzed
            at the University of Iowa. What we learn about your child from these
            samples will not be shared with you or your child’s doctor or put in
            your child’s health record.
          </Text>

          <Text style={styles.subTitle}>
            Genetic Information Nondiscrimination Act (GINA)
          </Text>
          <Text style={styles.text}>
            A federal law called the Genetic Information Nondiscrimination Act
            (GINA) generally makes it illegal for health insurance companies,
            group health plans, and employers of 15 or more persons to
            discriminate against you based on your genetic information. Based on
            this new law, health insurance companies and group health plans are
            prohibited from requesting your genetic information that we get from
            this research. This means that they may not use your genetic
            information when making decisions regarding your eligibility for
            insurance coverage or the amount of your insurance premiums. Be
            aware that this new federal law will not protect you against genetic
            discrimination by companies that sell life insurance, disability
            insurance, or long-term care insurance. The law also does not
            prohibit discrimination if you are already known to have a genetic
            disease or disorder.
          </Text>

          <Text style={styles.subTitle}>
            Audio Recording/Video Recording/Photographs
          </Text>
          <Text style={styles.text}>
            One aspect of this study involves researchers studying the video
            recordings and photographs of you/your child, which you will collect
            and upload to the BabySteps application. In this study, these will
            be used to observe social behavior and development over the first
            three years of life. We may use this data and these videos to study
            things like your child's developmental progress, or their sounds,
            gestures, movements, or interactions with you. Only researchers from
            this study or research collaborators will have access to these
            videos.
          </Text>
          <Text style={styles.text}>
            However, the photos, recordings, and other study data may be useful
            in future research studies. Your/your child's data may be stripped
            of identifiers (such as name, date of birth, address, etc.) and
            placed in a central repository or other national repositories
            sponsored by the National Institutes of Health or other Federal
            agencies. Other qualified researchers who obtain proper permisison
            may gain access to your data for use in approved research studies
            that may or may not be related to the purpose of this study.
          </Text>

          <View style={styles.checkboxView}>
            <Text style={styles.header}>
              One aspect of this study involves researchers studying the video
              recordings and photographs of you/your child. Only researchers
              from this study or research collaborators will have access to
              these videos. However, the photos, recordings, and other study
              data may be useful in future research studies. Please select one
              option below:
            </Text>

            <CheckBox
              title="Yes, I allow the investigators to show digital video clips 
                of the interaction with my child during research presentations. 
                These videos may also be used by researchers at other institutions, 
                who are working with the current Principal Investigator on this study."
              textStyle={styles.checkboxText}
              checked={video_presentation === 'yes_study_presentations'}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('video_presentation', 'yes_study_presentations')
              }
            />

            <CheckBox
              title="Yes, I allow the investigators to show digital video clips of 
                the interaction with my child during research presentations. These
                videos may NOT be used by researchers at other institutions, who
                are working with the current Principal Investigator on this study."
              textStyle={styles.checkboxText}
              checked={video_presentation === 'yes_other_presentations'}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('video_presentation', 'yes_other_presentations')
              }
            />

            <CheckBox
              title="No, I don’t allow the investigators to show digital video clips
                of the interaction with my child during research presentations. These
                videos may NOT be used by researchers at other institutions."
              textStyle={styles.checkboxText}
              checked={video_presentation === 'no_presentations'}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('video_presentation', 'no_presentations')
              }
            />
          </View>

          <Text style={styles.text}>
            The tests we and other researchers might want to use to study your
            data/videos may not even exist at this time. Therefore, we are
            asking for your permission to store the data/videos so that we can
            study them in the future. These future studies may provide
            additional information that will be helpful in understanding Autism
            Spectrum Disorder and other developmental disorders. However, it is
            unlikely that what we learn from these studies will have a direct
            benefit to you. It is possible that your data/videos might be used
            to develop products or tests that could be patented and licensed.
            There are no plans to provide financial compensation to you should
            this occur.
          </Text>
          <Text style={styles.text}>
            Video data, including the video of you and your child playing
            together, may also be uploaded to a web-based research library
            called Databrary. If you give your permission, these video clips may
            be shared with other researchers who agree to maintain the same
            standards of confidentiality.
          </Text>

          <View style={styles.checkboxView}>
            <Text style={styles.header}>
              Video data, including the video of you and your child playing
              together, may also be uploaded to a web-based research library
              called Databrary. Please select one option below:
            </Text>

            <CheckBox
              title="Yes, I allow the investigators to share video clips of me
                and my child to other researchers at other institutions, via the
                Databrary database."
              textStyle={styles.checkboxText}
              checked={video_sharing === 'yes_other_researchers'}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('video_sharing', 'yes_other_researchers')
              }
            />

            <CheckBox
              title="No, I do not allow the investigators to share video clips
                of me or my child to other researchers at other institutions, via
                the Databrary database."
              textStyle={styles.checkboxText}
              checked={video_sharing === 'no_other_researchers'}
              disabled={formState !== 'edit'}
              onPress={() =>
                this.props.handleConsentPermissions('video_sharing', 'no_other_researchers')
              }
            />
          </View>

          <Text style={styles.text}>
            If you agree now to future use of your data, but decide in the
            future that you would like to have it removed from future research,
            you should contact Lane Strathearn MD PhD (319-356-7044). However,
            if some research with your data has already been completed, the
            information from that research may still be used. We will also keep
            your name and contact information (address, phone number, email
            address, and alternate contact) so that we can contact you in the
            future if we have additional research projects that you may qualify
            for. If this happens, we will provide you with a new consent
            document and you will have the choice whether or not to participate
            in these additional studies. Agreeing to participate in this study
            does not commit you to any future studies.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-cog"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>What are the Risks of This Study?</Text>
          <Text style={styles.text}>
            You or your child may experience one or more of the risks indicated
            below from being in this study. In addition to these, there may be
            other unknown risks, or risks that we did not anticipate, associated
            with being in this study.
          </Text>

          <Text style={styles.text}>

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              You or your child might feel discomfort when you are videotaped,
              or when you complete some of the questionnaires. You may decline
              to answer any prompts or questions you wish.
            </Text>
            {'\n'}

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              Your child may experience some physical pain, bruising or
              emotional distress from having his/her blood taken. There is a
              small risk for complications related to this procedure.
            </Text>
            {'\n'}

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              There may be information uncovered during this research study
              indicating physical or sexual abuse of a child under the age of 18
              years. The researcher conducting this study is required to follow
              the University of Iowa policy on Mandatory Reporting of Physical
              and Sexual Abuse of Children. We will be required to report this
              information to the authorities.
            </Text>
            {'\n'}

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              There is a risk of loss of confidentiality of your/your child’s
              samples or data. Measures in place to minimize this risk are
              indicated in the "What About Confidentiality” section later in
              this document.
            </Text>
          </Text>

          <Text style={styles.subTitle}>Genetic Research</Text>
          <Text style={styles.text}>
            One risk of giving samples for this research may be the release of
            your name that could link you or your child to the stored samples
            and/or the results of the tests run on your child's samples. To
            prevent this, these samples will be given a code. Only the study
            staff will know the code. The name associated with the code will be
            kept in a locked file or in a computer with a password. Only the
            primary study investigators will have access to your name. Data will
            likewise be stored on a secure, password-protected server. If your
            child's blood samples are saved for future research, sample,
            information, and/or data may be stripped of identifiers (such as
            name, date of birth, address, etc.) and placed in a central
            repository or other national repositories sponsored by the National
            Institutes of Health or other Federal agencies. Only qualified
            researchers who obtain proper permission may gain access to your
            child's sample and/or data for use in approved research studies.
          </Text>
          <Text style={styles.text}>
            The de-identified data will be used for research at the University
            of Iowa, and may only be shared with researchers approved by the
            University of Iowa who uphold the same standards of confidentiality.
            If you did not consent to your/your child's data being saved for
            future studies, your/your child's data will be destroyed upon study
            completion.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-beaker"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            What are the Benefits of this Study?
          </Text>
          <Text style={styles.text}>
            We don’t know if you or your child will benefit from being in this
            study.
          </Text>
          <Text style={styles.text}>
            However, we hope that in the future, other people might benefit from
            this study by using the smartphone app and blood samples to collect
            information about possible risk factors for autism and other
            developmental problems in early childhood.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-cash"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Will it Cost Me Anything to be in this Study?
          </Text>
          <Text style={styles.text}>
            You will not have any additional costs associated with being in this
            research study. There will be no costs to you for the smart phone
            app, screening questionnaires, or genetic testing of your child’s
            blood samples. You and/or your health insurance company will be
            billed for any tests or procedures that are part of you or your
            child’s regular medical care, including the costs associated with
            any in-person diagnostic evaluations you/your child may be referred
            for during the study, or other blood tests.
          </Text>

          <Text style={styles.header}>
            Will My Child and I be Paid for Participating?
          </Text>
          <Text style={styles.text}>
            All families will receive a $20 Amazon.com gift card after their
            child's blood sample collection is received. All families will
            receive an additional $40 Amazon.com giftcard at the conclusion of
            the study after all their surveys and videos have been collected and
            received by the research team. Therefore, the total compensation for
            this project is $60 
          </Text>

          <Text style={styles.subTitle}>Who is funding this study?</Text>
          <Text style={styles.text}>
            The study will be funded by the University of Iowa. The University
            and the research team are receiving no payments from other agencies,
            organizations or companies to conduct this research study.
          </Text>

          <Text style={styles.subTitle}>
            What if my child is injured as a result of this study?
          </Text>
          <Text style={styles.text}>

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              If your child is injured or becomes ill from taking part in this
              study, medical treatment is available at the University of Iowa
              Hospitals and Clinics.
            </Text>
            {'\n'}

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              The University of Iowa does not plan to provide free medical care
              or payment for treatment of any illness or injury resulting from
              this study unless it is the direct result of proven negligence by
              a University employee.
            </Text>
            {'\n'}

            <Text style={styles.bullet}>{'\u2022'} </Text>
            <Text style={styles.listText}>
              If your child experiences a research-related illness or injury,
              you and/or your medical or hospital insurance carrier will be
              responsible for the cost of treatment.
            </Text>
            {'\n'}
          </Text>

        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-lock"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>What About Confidentiality?</Text>
          <Text style={styles.text}>
            We will keep your/your child's participation in this research study
            confidential to the extent permitted by law. However, it is possible
            that other people such as those indicated below may become aware of
            your participation in this study and may inspect and copy records
            pertaining to this research. Some of these records could contain
            information that personally identifies you or your child.
          </Text>
          <View style={styles.list}>
            <Text style={styles.bullet}>{'\u2022'}</Text>
            <Text style={styles.listText}>
              federal government regulatory agencies,
            </Text>
          </View>

          <View style={styles.list}>
            <Text style={styles.bullet}>{'\u2022'}</Text>
            <Text style={styles.listText}>
              The Food and Drug Administration,
            </Text>
          </View>

          <View style={styles.list}>
            <Text style={styles.bullet}>{'\u2022'}</Text>
            <Text style={styles.listText}>
              Auditing departments of the University of Iowa, and
            </Text>
          </View>
          <View style={styles.list}>
            <Text style={styles.bullet}>{'\u2022'}</Text>
            <Text style={styles.listText}>
              the University of Iowa Institutional Review Board (a committee
              that reviews and approves research studies)
            </Text>
          </View>
          <Text style={styles.text}>
            FullStack, Inc., created and maintains the BabySteps app, and as a
            result, they may have access to your data. To protect your/your
            child's privacy, The University of Iowa Hospitals and Clincs has
            entered into a strict confidentiality agreement with FullStack, Inc.
            Such agreement ensures the company is responsible for meeting the
            same terms of confidentially as other study researchers or
            collaborators.
          </Text>
          <Text style={styles.text}>
            We will only ask you to provide information necessary to meet the
            aims of this study. Any information collected by computer or
            smartphone will be transmitted securely and confidentially. For any
            genetic or behavioral information stored, it will be stored on a
            secure database, and only a limited number of research team members
            will have access to your name. All other users of the information
            will not have access to any identifying information. Any paper
            documents or blood samples will be labeled only with a code and will
            be kept in secure locations. If we write a report or article about
            this study or share the study dataset with others, we will do so in
            such a way that you cannot be directly identified.
          </Text>
          <Text style={styles.text}>
            The University of Iowa Hospitals and Clinics generally requires that
            we document your participation in research occurring in a University
            of Iowa Healthcare facility. This documentation will be in either
            your medical record or a database maintained on behalf of the
            institution reflecting that you are participaitng in this study. The
            information included will provide contact information for the
            research team, as well as information about the risks associated
            with this study. We will keep this Informed Consent Document in our
            research files; it will not be placed in your medical record chart.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-information-circle"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Will My Child's Health Information Be Used During This Study?
          </Text>
          <Text style={styles.text}>
            The Federal Health Insurance Portability and Accountability Act
            (HIPAA) requires your child's healthcare provider to obtain your
            permission for the research team to access or create “protected
            health information” about your child for purposes of this research
            study. Protected health information is information that personally
            identifies your child and relates to your child's past, present, or
            future physical or mental health condition or care. We will access
            or create health information about your child, as described in this
            document, for purposes of this research study. Once your child's
            healthcare provider has disclosed your child's protected health
            information to us, it may no longer be protected by the Federal
            HIPAA privacy regulations, but we will continue to protect your
            child's confidentiality as described under “Confidentiality.”
          </Text>
          <Text style={styles.text}>
            We may share your child's health information related to this study
            with other parties including federal government regulatory agencies,
            the University of Iowa Institutional Review Boards and support
            staff, and colleagues at other institutions who are involved in this
            study.
          </Text>
          <Text style={styles.text}>
            Your child cannot participate in this study unless you permit us to
            use your child's protected health information. If you choose not to
            allow us to use your child's protected health information, we will
            discuss any non-research alternatives available to your child. Your
            decision will not affect your child's right to medical care that is
            not research-related. Your signature on this Consent Document
            authorizes your child's healthcare provider to give us permission to
            use or create health information about you and your child.
          </Text>
          <Text style={styles.text}>
            Although you may not be allowed to see study information until after
            this study is over, you may be given access to your child's health
            care records by contacting your child's health care provider. Your
            permission for us to access or create protected health information
            about your child for purposes of this study has no expiration date.
            You may withdraw your permission for us to use your child's health
            information for this research study by sending a written notice to
            Attachment and Neurodevelopment Lab, 100 Hawkins Dr., 363 CDD, Iowa City, IA 52242.
            However, we may still use your child's health information that was
            collected before withdrawing your permission. Also, if we have sent
            your child's health information to a third party, such as the study
            sponsor, or we have removed your child's identifying information, it
            may not be possible to prevent its future use. You will receive a
            copy of this signed document.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-paper-plane"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>
            Will I Receive New Information About the Study While Participating?
          </Text>
          <Text style={styles.text}>
            If we obtain any new information during this study that might affect
            your willingness for you and your child to continue participating in
            the study, we will promptly provide you with that information.
          </Text>
        </View>

        <View style={styles.elevated}>
          <Ionicons
            name="md-thumbs-up"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>Is Being in this Study Voluntary?</Text>
          <Text style={styles.text}>
            Taking part in this research study is completely voluntary. You may
            choose not to take part at all. If you decide for you and your child
            to be in this study, you may stop participating at any time. If you
            decide for you and your child not to be in this study, or if you
            stop participating at any time, you and your child won’t be
            penalized or lose any benefits for which you otherwise qualify.
          </Text>
        </View>

        <View style={styles.elevated}>

          <Ionicons
            name="md-help"
            size={28}
            style={styles.icon}
            color={Colors.iconDefault}
          />

          <Text style={styles.header}>What if I have Questions</Text>
          <Text style={styles.text}>
            We encourage you to ask questions. If you have any questions about
            the research study itself or if you or your child experiences a
            research-related injury, please contact: Lane Strathearn (319 356
            7044 or babysteps@healthcare.uiowa.edu).
          </Text>
          <Text style={styles.text}>
            If you have questions, concerns, or complaints about your and your
            child's rights as a research subject or about research-related
            injury, please contact the Human Subjects Office, 105 Hardin Library
            for the Health Sciences, 600 Newton Rd, The University of Iowa, Iowa
            City, IA 52242-1098, (319) 335-6564, or e-mail irb@uiowa.edu.
            General information about being a research subject can be found by
            clicking “Info for Public” on the Human Subjects Office website,
            http://hso.research.uiowa.edu/. To offer input about you or your
            child's experiences as a research subject or to speak to someone
            other than the research staff, call the Human Subjects Office at the
            number above.
          </Text>
          <Text style={styles.text}>
            This Informed Consent Document is not a contract. It is a written
            explanation of what will happen during the study if you decide for
            you and your child to participate. You are not waiving any legal
            rights by signing this Informed Consent Document. Your signature
            indicates that this research study has been explained to you, that
            your questions have been answered, and that you agree for you and
            your child to take part in this study. You will receive a copy of
            this form.
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    marginTop: 5,
  },
  header: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  subTitle: {
    fontWeight: '600',
    padding: 5,
  },
  text: {
    //textAlign: 'center',
    fontSize: 12,
    padding: 5,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  bold: {
    fontWeight: '600',
  },
  checkboxView: {
    marginBottom: 0,
  },
  checkboxText: {
    fontSize: 11,
  },
  list: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  bullet: {
    fontSize: 18,
    marginTop: -3,
  },
  listText: {
    fontSize: 12,
    paddingLeft: 5,
  },
  elevated: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingRight: 5,
    paddingLeft: 5,
    paddingBottom: 10,
    marginBottom: 20,
    elevation: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
  },
});

const mapStateToProps = ({ session, registration }) => ({
  session,
  registration,
});

export default connect(mapStateToProps)(ConsentDisclosureContent002);
